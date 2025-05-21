import { cssInterop } from 'nativewind'
import { Pagination } from 'react-native-reanimated-carousel'

const PaginationBasic = cssInterop(Pagination.Basic, {
  activeDotClassName: { target: 'activeDotStyle' },
  containerClassName: { target: 'containerStyle' },
  dotClassName: { target: 'dotStyle' },
})

const PaginationCustom = cssInterop(Pagination.Custom, {
  activeDotClassName: { target: 'activeDotStyle' },
  containerClassName: { target: 'containerStyle' },
  dotClassName: { target: 'dotStyle' },
})

export { PaginationBasic, PaginationCustom }
