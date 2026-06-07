import * as React from "react";
import { Send, Link2, Key } from "lucide-react";
import { ConfigCard, Skeleton } from "@/shared/ui";
import {
  PROJECT_SECRET_CATEGORIES,
  PROJECT_SECRET_LABELS,
  PROJECT_SECRET_DESCRIPTIONS,
} from "@/entities/project-secret";
import type { ProjectSecret, ProjectSecretType } from "@/shared/types/api";

const categoryIcons: Record<string, React.ElementType> = {
  telegram: Send,
  webhooks: Link2,
  custom: Key,
};

interface SecretsGridProps {
  isLoading: boolean;
  secretsByType: Map<string, ProjectSecret>;
  onEdit: (secret: ProjectSecret) => void;
  onCreate: (secretType: ProjectSecretType) => void;
  onDelete: (secret: ProjectSecret) => void;
  onValidateCard: (secret: ProjectSecret) => void;
}

export function SecretsGrid({
  isLoading,
  secretsByType,
  onEdit,
  onCreate,
  onDelete,
  onValidateCard,
}: SecretsGridProps) {
  return (
    <div className="space-y-8">
      {PROJECT_SECRET_CATEGORIES.map((category) => {
        const Icon = categoryIcons[category.id] ?? Key;

        return (
          <section key={category.id}>
            <div className="flex items-center gap-2 mb-4">
              <Icon className="size-5 text-text-secondary" />
              <h2 className="text-lg font-medium text-text-primary">{category.name}</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {isLoading ? (
                <Skeleton className="h-32" />
              ) : (
                category.keys.map((keyType) => {
                  const secret = secretsByType.get(keyType);
                  const label = PROJECT_SECRET_LABELS[keyType as ProjectSecretType];
                  const description = PROJECT_SECRET_DESCRIPTIONS[keyType as ProjectSecretType];
                  const showValidate = keyType === "telegram_bot_token";

                  if (secret) {
                    return (
                      <ConfigCard
                        key={keyType}
                        keyType={keyType}
                        displayName={secret.display_name}
                        description={secret.description ?? description}
                        maskedValue={secret.masked_value}
                        isSet={secret.is_set}
                        isActive={secret.is_active}
                        updatedAt={secret.updated_at}
                        onEdit={() => onEdit(secret)}
                        onDelete={() => onDelete(secret)}
                        onValidate={showValidate ? () => onValidateCard(secret) : undefined}
                        showValidate={showValidate}
                      />
                    );
                  }

                  // Not configured yet - show placeholder card
                  return (
                    <ConfigCard
                      key={keyType}
                      keyType={keyType}
                      displayName={label}
                      description={description}
                      isSet={false}
                      isActive={false}
                      onEdit={() => onCreate(keyType as ProjectSecretType)}
                    />
                  );
                })
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
