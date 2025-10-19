// FluLink v4.0 统一组件导出
// 基于《德道经》"无为而治"哲学的统一组件库

// UI 基础组件
export {
  Button,
  Input,
  Textarea,
  Card,
  Modal,
  Loading,
  Tag,
  Avatar
} from './ui/index'

// 导航组件
export {
  TopNav,
  BottomNav,
  Sidebar,
  Breadcrumb,
  TabNav
} from './navigation/index'

// 业务组件
export { UserProfile } from './user-profile/user-profile'
export { StarMap } from './star-map/star-map'
export { StarClusterView } from './star-clusters/star-cluster-view'
export { AISeedCreator } from './seed-creator/ai-seed-creator'

// 类型定义
export type { ButtonProps } from './ui/index'
export type { InputProps } from './ui/index'
export type { TextareaProps } from './ui/index'
export type { CardProps } from './ui/index'
export type { ModalProps } from './ui/index'
export type { LoadingProps } from './ui/index'
export type { TagProps } from './ui/index'
export type { AvatarProps } from './ui/index'

export type { TopNavProps } from './navigation/index'
export type { BottomNavProps } from './navigation/index'
export type { SidebarProps } from './navigation/index'
export type { BreadcrumbProps } from './navigation/index'
export type { TabNavProps } from './navigation/index'

export type { UserProfileProps } from './user-profile/user-profile'
export type { StarMapProps } from './star-map/star-map'
export type { StarClusterViewProps } from './star-clusters/star-cluster-view'
export type { AISeedCreatorProps } from './seed-creator/ai-seed-creator'
