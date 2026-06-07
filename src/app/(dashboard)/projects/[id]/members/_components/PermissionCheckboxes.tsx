"use client";

import { Checkbox } from "@/shared/ui/checkbox";
import { Label } from "@/shared/ui/label";

export interface MemberPermissions {
  can_manage_avatars: boolean;
  can_manage_documents: boolean;
  can_manage_members: boolean;
  can_view_analytics: boolean;
  can_manage_settings: boolean;
}

export function PermissionCheckboxes({
  permissions,
  onChange,
}: {
  permissions: MemberPermissions;
  onChange: (p: MemberPermissions) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center space-x-2">
        <Checkbox
          id="avatars"
          checked={permissions.can_manage_avatars}
          onCheckedChange={(c) => onChange({ ...permissions, can_manage_avatars: !!c })}
        />
        <Label htmlFor="avatars" className="font-normal">
          Управление аватарами
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="documents"
          checked={permissions.can_manage_documents}
          onCheckedChange={(c) => onChange({ ...permissions, can_manage_documents: !!c })}
        />
        <Label htmlFor="documents" className="font-normal">
          Управление документами
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="members"
          checked={permissions.can_manage_members}
          onCheckedChange={(c) => onChange({ ...permissions, can_manage_members: !!c })}
        />
        <Label htmlFor="members" className="font-normal">
          Управление участниками
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="analytics"
          checked={permissions.can_view_analytics}
          onCheckedChange={(c) => onChange({ ...permissions, can_view_analytics: !!c })}
        />
        <Label htmlFor="analytics" className="font-normal">
          Просмотр аналитики
        </Label>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox
          id="settings"
          checked={permissions.can_manage_settings}
          onCheckedChange={(c) => onChange({ ...permissions, can_manage_settings: !!c })}
        />
        <Label htmlFor="settings" className="font-normal">
          Управление настройками
        </Label>
      </div>
    </div>
  );
}
