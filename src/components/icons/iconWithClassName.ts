import type { LucideIcon } from 'lucide-react-native'
import { cssInterop } from 'nativewind'

/**
 * Enhances a Lucide icon to support Tailwind CSS class names.
 * This allows you to use Tailwind classes for styling the icon.
 *
 * @param icon - The Lucide icon to enhance.
 */
export function iconWithClassName(icon: LucideIcon) {
  cssInterop(icon, {
    className: {
      target: 'style',
      nativeStyleToProp: {
        color: true,
        opacity: true,
        width: true,
        height: true,
      },
    },
  })
}
