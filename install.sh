#!/usr/bin/env bash
#
# install.sh — bring agentic-resume-builder up on a clean machine.
#
# Verifies (and optionally installs) Docker, builds the image, starts the
# stack, then smoke-tests the viewer and the PDF export endpoint.
#
# Usage:
#   ./install.sh                 build and start on http://localhost:3000
#   ./install.sh --port 8080     publish on a different host port
#   ./install.sh --yes           never prompt (installs Docker if missing)
#   ./install.sh --build-only    build the image, do not start anything

set -euo pipefail

readonly REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
readonly SERVICE="agentic-resume-builder"
readonly REQUIRED_PATHS=(Dockerfile docker-compose.yml package.json pnpm-lock.yaml content resumes public src)

HOST_PORT="${HOST_PORT:-3000}"
ASSUME_YES=0
BUILD_ONLY=0
COMPOSE=()

if [[ -t 1 ]]; then
  C_RED=$'\033[31m'; C_YEL=$'\033[33m'; C_GRN=$'\033[32m'; C_DIM=$'\033[2m'; C_OFF=$'\033[0m'
else
  C_RED=''; C_YEL=''; C_GRN=''; C_DIM=''; C_OFF=''
fi

log()  { printf '%s==>%s %s\n' "$C_GRN" "$C_OFF" "$*"; }
info() { printf '%s    %s%s\n' "$C_DIM" "$*" "$C_OFF"; }
warn() { printf '%swarn:%s %s\n' "$C_YEL" "$C_OFF" "$*" >&2; }
die()  { printf '%serror:%s %s\n' "$C_RED" "$C_OFF" "$*" >&2; exit 1; }
have() { command -v "$1" >/dev/null 2>&1; }

confirm() {
  (( ASSUME_YES )) && return 0
  [[ -t 0 ]] || die "$1 (re-run with --yes to allow this non-interactively)"
  local reply
  read -r -p "$1 [y/N] " reply
  [[ "$reply" =~ ^[Yy]$ ]]
}

parse_args() {
  while (( $# )); do
    case "$1" in
      --port) HOST_PORT="${2:-}"; [[ -n "$HOST_PORT" ]] || die "--port needs a value"; shift 2 ;;
      --yes|-y) ASSUME_YES=1; shift ;;
      --build-only) BUILD_ONLY=1; shift ;;
      -h|--help) sed -n '3,12p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'; exit 0 ;;
      *) die "unknown argument: $1" ;;
    esac
  done
  [[ "$HOST_PORT" =~ ^[0-9]+$ ]] && (( HOST_PORT > 0 && HOST_PORT < 65536 )) \
    || die "invalid port: $HOST_PORT"
}

check_repo() {
  log "Checking repository layout"
  local missing=()
  for p in "${REQUIRED_PATHS[@]}"; do
    [[ -e "$REPO_DIR/$p" ]] || missing+=("$p")
  done
  (( ${#missing[@]} == 0 )) || die "missing from repo: ${missing[*]}"

  local configs
  configs=$(find "$REPO_DIR/resumes" -maxdepth 1 -name '*.yaml' -o -maxdepth 1 -name '*.yml' | wc -l)
  (( configs > 0 )) || warn "no resume configs in resumes/ — the viewer will start but render nothing"
  info "layout OK, ${configs} resume config(s) found"
}

install_docker() {
  have apt-get || die "automatic Docker install only supports Debian/Ubuntu. Install Docker Engine + Compose v2 manually, then re-run."
  grep -qi microsoft /proc/version 2>/dev/null &&
    warn "WSL detected — enabling Docker Desktop's WSL integration is usually preferable to installing Docker Engine inside the distro."
  confirm "Install Docker Engine from Docker's official apt repository (needs sudo)?" \
    || die "Docker is required. Install it and re-run."

  local id codename
  id=$(. /etc/os-release && echo "${ID}")
  codename=$(. /etc/os-release && echo "${VERSION_CODENAME:-${UBUNTU_CODENAME:-}}")
  [[ -n "$codename" ]] || die "cannot determine distro codename from /etc/os-release"
  [[ "$id" == "debian" || "$id" == "ubuntu" ]] || die "unsupported distro for auto-install: $id"

  log "Installing Docker Engine ($id $codename)"
  sudo apt-get update
  sudo apt-get install -y ca-certificates curl gnupg
  sudo install -m 0755 -d /etc/apt/keyrings
  curl -fsSL "https://download.docker.com/linux/${id}/gpg" \
    | sudo gpg --dearmor --yes -o /etc/apt/keyrings/docker.gpg
  sudo chmod a+r /etc/apt/keyrings/docker.gpg
  printf 'deb [arch=%s signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/%s %s stable\n' \
    "$(dpkg --print-architecture)" "$id" "$codename" \
    | sudo tee /etc/apt/sources.list.d/docker.list >/dev/null
  sudo apt-get update
  sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

  if ! getent group docker | grep -qw "$USER"; then
    sudo usermod -aG docker "$USER"
    warn "added $USER to the 'docker' group — log out and back in (or run 'newgrp docker') for it to take effect"
  fi
}

check_docker() {
  log "Checking Docker"
  have docker || install_docker
  have docker || die "docker still not on PATH after install"

  docker compose version >/dev/null 2>&1 \
    || die "Docker Compose v2 plugin missing. Install 'docker-compose-plugin' and re-run."
  COMPOSE=(docker compose)

  if ! docker info >/dev/null 2>&1; then
    if have systemctl && confirm "Docker daemon is not responding. Start it with systemctl?"; then
      sudo systemctl enable --now docker
      sleep 3
    fi
    docker info >/dev/null 2>&1 \
      || die "cannot talk to the Docker daemon. Start Docker (or fix group membership with 'newgrp docker') and re-run."
  fi
  info "$(docker --version), $(docker compose version --short 2>/dev/null || echo 'compose v2')"
}

check_port() {
  if have ss && ss -ltn "sport = :$HOST_PORT" 2>/dev/null | grep -q LISTEN; then
    die "host port $HOST_PORT is already in use. Pick another with --port."
  fi
}

build() {
  log "Building image (first run pulls Node + Chromium, expect several minutes)"
  ( cd "$REPO_DIR" && HOST_PORT="$HOST_PORT" "${COMPOSE[@]}" build )
}

start() {
  log "Starting $SERVICE on host port $HOST_PORT"
  ( cd "$REPO_DIR" && HOST_PORT="$HOST_PORT" "${COMPOSE[@]}" up -d )
}

wait_ready() {
  log "Waiting for the app to answer"
  local url="http://localhost:${HOST_PORT}/"
  for _ in $(seq 1 60); do
    if have curl && curl -fsS -o /dev/null "$url" 2>/dev/null; then
      info "viewer responding at $url"
      return 0
    fi
    sleep 2
  done
  ( cd "$REPO_DIR" && "${COMPOSE[@]}" logs --tail 40 "$SERVICE" ) || true
  die "app did not become ready within 120s (logs above)"
}

smoke_test_pdf() {
  have curl || { warn "curl not found — skipping PDF smoke test"; return 0; }
  local config out code
  config=$(basename "$(find "$REPO_DIR/resumes" -maxdepth 1 -name '*.yaml' | sort | head -1)" .yaml)
  [[ -n "$config" ]] || { warn "no config to smoke-test"; return 0; }

  log "Smoke-testing PDF export (config: $config)"
  out=$(mktemp)
  code=$(curl -sS -o "$out" -w '%{http_code}' -X POST \
    "http://localhost:${HOST_PORT}/api/export-pdf" \
    -H 'Content-Type: application/json' \
    -d "{\"configName\":\"${config}\"}" || true)

  if [[ "$code" == "200" && "$(head -c 4 "$out")" == "%PDF" ]]; then
    info "PDF export OK ($(wc -c < "$out") bytes)"
  else
    rm -f "$out"
    die "PDF export failed (HTTP $code). Check: ${COMPOSE[*]} logs $SERVICE"
  fi
  rm -f "$out"
}

summary() {
  cat <<EOF

${C_GRN}agentic-resume-builder is running.${C_OFF}

  Viewer      http://localhost:${HOST_PORT}/
  Render one  http://localhost:${HOST_PORT}/render/<config-name>
  Export PDF  POST /api/export-pdf  {"configName":"<config-name>"}

  Logs        docker compose logs -f ${SERVICE}
  Stop        docker compose down
  Restart     docker compose restart ${SERVICE}

content/ and resumes/ are mounted read-only from this checkout — edit them and
reload the page; no rebuild required. Rebuild only after changing src/.
EOF
}

main() {
  parse_args "$@"
  check_repo
  check_docker
  build
  if (( BUILD_ONLY )); then
    log "Image built. Skipping start (--build-only)."
    exit 0
  fi
  check_port
  start
  wait_ready
  smoke_test_pdf
  summary
}

main "$@"
