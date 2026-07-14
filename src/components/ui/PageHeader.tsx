interface PageHeaderProps {
  title: string;
  description?: string;
}

export function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <header className="mb-8">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      {description ? (
        <p className="mt-2 text-gray-600">{description}</p>
      ) : null}
    </header>
  );
}
