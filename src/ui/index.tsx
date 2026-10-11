// @inkress/app-kit/ui — the merchant dashboard's components for embedded apps (INK-1091).
// CLIENT-SAFE. Import the stylesheet once in root.tsx: `import ui from "@inkress/app-kit/ui.css?url"`.
// Every component here is drawn on the INK-1071 design board.

export { Tone, IconTone, ButtonKind, ButtonSize, Align, Trend, StepState } from "./types";
export { ICON_PATHS, type IconName } from "./icons";
export { CURRENCY_PREFIX, formatMoney, formatDate, formatTime, relativeTime, daysUntil, DEFAULT_TIME_ZONE } from "./format";

export {
  cx,
  Icon,
  Button,
  ButtonLink,
  ExternalButton,
  StatusPill,
  Callout,
  EmptyState,
  ErrorState,
  Skeleton,
  SkeletonRows,
} from "./primitives";
export type { IconProps, ButtonProps, ButtonLinkProps, ExternalButtonProps, StatusPillProps, CalloutProps, EmptyStateProps, ErrorStateProps } from "./primitives";

export {
  AppNav,
  AppFrame,
  PageHeader,
  Box,
  StatTiles,
  AttentionItem,
  SetupChecklist,
  BarChart,
  Hub,
  KeyValue,
  Timeline,
  FormSection,
} from "./layout";
export type { AppNavItem, PageHeaderProps, BoxProps, StatTile, AttentionItemProps, SetupStep, Bar, HubTile, TimelineEntry } from "./layout";

export { StatusTabs, SearchBox, FilterSelect, FilterBar, DataTable, Pager, BulkBar } from "./table";
export type { StatusTab, FilterOption, Column, DataTableProps } from "./table";

export {
  Field,
  TextField,
  TextAreaField,
  AffixField,
  MoneyField,
  SelectField,
  DateField,
  Switch,
  OptionCards,
  Segmented,
  ColorSwatches,
  FileDrop,
  Combobox,
  SaveBar,
  SaveState,
  initials,
} from "./form";
export type { FieldProps, TextFieldProps, TextAreaFieldProps, AffixFieldProps, SelectFieldProps, SwitchProps, OptionCard, FileDropProps, ComboOption, ComboboxProps, SaveBarProps } from "./form";

export { Dialog, SidePanel, CopyField, useClipboard } from "./overlay";
export type { DialogProps } from "./overlay";
