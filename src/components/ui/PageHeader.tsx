interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-8">
      <h1 className="font-display text-3xl font-medium text-foreground">
        {title}
      </h1>
      {description ? (
        <p className="mt-2 max-w-prose text-pretty leading-relaxed text-muted">
          {description}
        </p>
      ) : null}
    </header>
  );
}
