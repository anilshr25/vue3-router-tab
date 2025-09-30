export interface MenuItem {
  title: string
  icon: string
  to: string
  badge?: string | number
  children?: MenuItem[]
}