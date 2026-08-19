import { describe, it, expect } from 'vitest';
import { cn } from '@/components/ui/cn';

describe('cn (class name utility)', () => {
  describe('when merging multiple classes', () => {
    it('merges multiple class names into single string', () => {
      const result = cn('class1', 'class2', 'class3');
      expect(result).toContain('class1');
      expect(result).toContain('class2');
      expect(result).toContain('class3');
    });

    it('merges classes from array', () => {
      const result = cn(['class1', 'class2']);
      expect(result).toContain('class1');
      expect(result).toContain('class2');
    });

    it('merges classes from mixed inputs', () => {
      const result = cn('base', ['array1', 'array2'], 'final');
      expect(result).toContain('base');
      expect(result).toContain('array1');
      expect(result).toContain('array2');
      expect(result).toContain('final');
    });
  });

  describe('when resolving Tailwind conflicts', () => {
    it('resolves conflicting padding classes with last value winning', () => {
      const result = cn('px-2', 'px-4');
      expect(result).toBe('px-4');
    });

    it('resolves conflicting text size classes', () => {
      const result = cn('text-sm', 'text-lg');
      expect(result).toBe('text-lg');
    });

    it('resolves conflicting margin classes', () => {
      const result = cn('m-2', 'm-4');
      expect(result).toBe('m-4');
    });

    it('resolves conflicting background color classes', () => {
      const result = cn('bg-blue-500', 'bg-red-500');
      expect(result).toBe('bg-red-500');
    });

    it('keeps non-conflicting classes from both inputs', () => {
      const result = cn('px-4 py-2', 'px-8 text-lg');
      expect(result).toContain('px-8');
      expect(result).toContain('py-2');
      expect(result).toContain('text-lg');
      expect(result).not.toContain('px-4');
    });
  });

  describe('when handling conditional classes', () => {
    it('includes class when condition is true', () => {
      const result = cn('base', true && 'conditional');
      expect(result).toContain('base');
      expect(result).toContain('conditional');
    });

    it('excludes class when condition is false', () => {
      const result = cn('base', false && 'conditional');
      expect(result).toContain('base');
      expect(result).not.toContain('conditional');
    });

    it('handles multiple conditional classes', () => {
      const isActive = true;
      const isDisabled = false;
      const result = cn('base', isActive && 'active', isDisabled && 'disabled');
      expect(result).toContain('base');
      expect(result).toContain('active');
      expect(result).not.toContain('disabled');
    });

    it('handles ternary conditional classes', () => {
      const variant = 'primary';
      const result = cn(
        'base',
        variant === 'primary' ? 'bg-blue-500' : 'bg-gray-500',
      );
      expect(result).toContain('base');
      expect(result).toContain('bg-blue-500');
      expect(result).not.toContain('bg-gray-500');
    });
  });

  describe('when handling undefined, null, or empty inputs', () => {
    it('handles undefined gracefully', () => {
      const result = cn('base', undefined, 'final');
      expect(result).toContain('base');
      expect(result).toContain('final');
    });

    it('handles null gracefully', () => {
      const result = cn('base', null, 'final');
      expect(result).toContain('base');
      expect(result).toContain('final');
    });

    it('handles empty string gracefully', () => {
      const result = cn('base', '', 'final');
      expect(result).toContain('base');
      expect(result).toContain('final');
    });

    it('handles all falsy values gracefully', () => {
      const result = cn('base', undefined, null, '', false, 0, 'final');
      expect(result).toContain('base');
      expect(result).toContain('final');
    });

    it('returns empty string when no valid classes provided', () => {
      const result = cn(undefined, null, '', false);
      expect(result).toBe('');
    });
  });

  describe('when handling object syntax', () => {
    it('includes classes where object value is true', () => {
      const result = cn({
        base: true,
        active: true,
        disabled: false,
      });
      expect(result).toContain('base');
      expect(result).toContain('active');
      expect(result).not.toContain('disabled');
    });

    it('merges object syntax with string classes', () => {
      const result = cn('default', {
        active: true,
        disabled: false,
      });
      expect(result).toContain('default');
      expect(result).toContain('active');
      expect(result).not.toContain('disabled');
    });
  });

  describe('when handling complex real-world scenarios', () => {
    it('handles component variant pattern', () => {
      const variant = 'primary';
      const size = 'lg';
      const disabled = false;

      const result = cn(
        'btn',
        variant === 'primary' && 'bg-blue-500 text-white',
        variant === 'secondary' && 'bg-gray-500 text-white',
        size === 'sm' && 'px-2 py-1 text-sm',
        size === 'lg' && 'px-6 py-3 text-lg',
        disabled && 'opacity-50 cursor-not-allowed',
      );

      expect(result).toContain('btn');
      expect(result).toContain('bg-blue-500');
      expect(result).toContain('text-white');
      expect(result).toContain('px-6');
      expect(result).toContain('py-3');
      expect(result).toContain('text-lg');
      expect(result).not.toContain('opacity-50');
    });

    it('handles dynamic class overrides', () => {
      const baseClasses = 'p-4 bg-white rounded';
      const overrideClasses = 'p-8 bg-gray-100';

      const result = cn(baseClasses, overrideClasses);

      expect(result).toContain('p-8');
      expect(result).toContain('bg-gray-100');
      expect(result).toContain('rounded');
      expect(result).not.toContain('p-4');
      expect(result).not.toContain('bg-white');
    });
  });
});
