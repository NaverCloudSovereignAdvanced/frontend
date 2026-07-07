import {
  Icon as IconifyIcon,
  addIcon,
  type IconProps as IconifyProps,
  type IconifyIcon as IconifyIconData,
} from "@iconify/react/dist/offline";

type IconName =
  | "tdesign:ai-edit-filled"
  | "mdi:file-plus-outline"
  | "material-symbols:search-rounded"
  | "material-symbols:scan-outline"
  | "material-symbols:arrow-drop-down-rounded"
  | "material-symbols:upload"
  | "material-symbols:check-circle"
  | "material-symbols:check-circle-rounded"
  | "material-symbols:cancel"
  | "material-symbols:print-outline"
  | "mdi:file-outline"
  | "ix:ai"
  | "lsicon:checkbox-filled";

const icons: Record<IconName, IconifyIconData> = {
  "tdesign:ai-edit-filled": {
    body: '<path fill="currentColor" d="M20.455 17.543L23.68 19l-3.225 1.456L19 23.68l-1.456-3.223L14.32 19l3.224-1.456L19 14.32zM22.415 6.5L8.294 20.62a3 3 0 0 1-2.122.88H1.5l.001-4.672a3 3 0 0 1 .878-2.121L16.5.585zM6.077 2.92L8.244 4L6.077 5.078L5 7.244L3.922 5.078L1.756 4l2.166-1.08L5 .756zM3.5 19.5h2.672a1 1 0 0 0 .707-.294L8.586 17.5L5.5 14.414L3.794 16.12a1 1 0 0 0-.293.707z"/>',
    width: 24,
    height: 24,
  },
  "mdi:file-plus-outline": {
    body: '<path fill="currentColor" d="M13.81 22H6c-1.11 0-2-.89-2-2V4a2 2 0 0 1 2-2h8l6 6v5.09c-.33-.05-.66-.09-1-.09s-.67.04-1 .09V9h-5V4H6v16h7.09c.12.72.37 1.39.72 2M23 18h-3v-3h-2v3h-3v2h3v3h2v-3h3z"/>',
    width: 24,
    height: 24,
  },
  "material-symbols:search-rounded": {
    body: '<path fill="currentColor" d="M9.5 16q-2.725 0-4.612-1.888T3 9.5t1.888-4.612T9.5 3t4.613 1.888T16 9.5q0 1.1-.35 2.075T14.7 13.3l5.6 5.6q.275.275.275.7t-.275.7t-.7.275t-.7-.275l-5.6-5.6q-.75.6-1.725.95T9.5 16m0-2q1.875 0 3.188-1.312T14 9.5t-1.312-3.187T9.5 5T6.313 6.313T5 9.5t1.313 3.188T9.5 14"/>',
    width: 24,
    height: 24,
  },
  "material-symbols:scan-outline": {
    body: '<path fill="currentColor" d="M6 22q-.825 0-1.412-.587T4 20v-3h2v3h12v-3h2v3q0 .825-.587 1.413T18 22zM4 11V4q0-.825.588-1.412T6 2h8l6 6v3h-2V9h-5V4H6v7zm-3 4v-2h22v2zm11 2"/>',
    width: 24,
    height: 24,
  },
  "material-symbols:arrow-drop-down-rounded": {
    body: '<path fill="currentColor" d="M11.475 14.475L7.85 10.85q-.075-.075-.112-.162T7.7 10.5q0-.2.138-.35T8.2 10h7.6q.225 0 .363.15t.137.35q0 .05-.15.35l-3.625 3.625q-.125.125-.25.175T12 14.7t-.275-.05t-.25-.175"/>',
    width: 24,
    height: 24,
  },
  "material-symbols:upload": {
    body: '<path fill="currentColor" d="M11 16V7.85l-2.6 2.6L7 9l5-5l5 5l-1.4 1.45l-2.6-2.6V16zm-5 4q-.825 0-1.412-.587T4 18v-3h2v3h12v-3h2v3q0 .825-.587 1.413T18 20z"/>',
    width: 24,
    height: 24,
  },
  "material-symbols:check-circle": {
    body: '<path fill="currentColor" d="m10.6 16.6l7.05-7.05l-1.4-1.4l-5.65 5.65l-2.85-2.85l-1.4 1.4zM12 22q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22"/>',
    width: 24,
    height: 24,
  },
  "material-symbols:check-circle-rounded": {
    body: '<path fill="currentColor" d="m10.6 13.8l-2.15-2.15q-.275-.275-.7-.275t-.7.275t-.275.7t.275.7L9.9 15.9q.3.3.7.3t.7-.3l5.65-5.65q.275-.275.275-.7t-.275-.7t-.7-.275t-.7.275zM12 22q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22"/>',
    width: 24,
    height: 24,
  },
  "material-symbols:cancel": {
    body: '<path fill="currentColor" d="m8.4 17l3.6-3.6l3.6 3.6l1.4-1.4l-3.6-3.6L17 8.4L15.6 7L12 10.6L8.4 7L7 8.4l3.6 3.6L7 15.6zm3.6 5q-2.075 0-3.9-.788t-3.175-2.137T2.788 15.9T2 12t.788-3.9t2.137-3.175T8.1 2.788T12 2t3.9.788t3.175 2.137T21.213 8.1T22 12t-.788 3.9t-2.137 3.175t-3.175 2.138T12 22"/>',
    width: 24,
    height: 24,
  },
  "material-symbols:print-outline": {
    body: '<path fill="currentColor" d="M16 8V5H8v3H6V3h12v5zM4 10h16zm14 2.5q.425 0 .713-.288T19 11.5t-.288-.712T18 10.5t-.712.288T17 11.5t.288.713t.712.287M16 19v-4H8v4zm2 2H6v-4H2v-6q0-1.275.875-2.137T5 8h14q1.275 0 2.138.863T22 11v6h-4zm2-6v-4q0-.425-.288-.712T19 10H5q-.425 0-.712.288T4 11v4h2v-2h12v2z"/>',
    width: 24,
    height: 24,
  },
  "mdi:file-outline": {
    body: '<path fill="currentColor" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8zm4 18H6V4h7v5h5z"/>',
    width: 24,
    height: 24,
  },
  "ix:ai": {
    body: '<path fill="currentColor" d="m320 192l-85.333-32L320 127.968l32-85.301l32.03 85.301L469.333 160l-85.303 32L352 277.333zM149.333 362.667L42.667 320l106.666-42.667L192 170.667l42.667 106.666L341.333 320l-106.666 42.667L192 469.333z"/>',
    width: 512,
    height: 512,
  },
  "lsicon:checkbox-filled": {
    body: '<path fill="currentColor" fill-rule="evenodd" d="M2 2.5a.5.5 0 0 1 .5-.5h11a.5.5 0 0 1 .5.5v11a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5zM3 3v10h10V3z" clip-rule="evenodd"/>',
    width: 16,
    height: 16,
  },
};

Object.entries(icons).forEach(([name, icon]) => {
  addIcon(name, icon);
});

type IconProps = Omit<IconifyProps, "icon" | "width" | "height"> & {
  name: IconName;
  size?: number;
};

export function Icon({ name, size = 20, ...props }: IconProps) {
  return (
    <IconifyIcon
      aria-hidden="true"
      icon={name}
      width={size}
      height={size}
      {...props}
    />
  );
}
