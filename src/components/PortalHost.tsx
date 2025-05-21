import { PortalHost as RNPPortalHost } from '@rn-primitives/portal'
import { Fragment } from 'react'
import { Platform } from 'react-native'
import { FullWindowOverlay } from 'react-native-screens'

const WindowOverlay = Platform.OS === 'ios' ? FullWindowOverlay : Fragment

export function PortalHost() {
  return (
    <WindowOverlay>
      <RNPPortalHost />
    </WindowOverlay>
  )
}
