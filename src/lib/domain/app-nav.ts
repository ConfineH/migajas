export interface AppNavLink {
  href: string;
  label: string;
}

export function buildAppNavLinks(input: {
  isLoggedIn: boolean;
  courseStarted: boolean;
  showDiary?: boolean;
  showGuide?: boolean;
  freeMode?: boolean;
  showAdmin?: boolean;
  showProfessional?: boolean;
}): {
  primary: AppNavLink[];
  more: AppNavLink[];
  mobilePinned: AppNavLink[];
} {
  const primary: AppNavLink[] = [];

  if (input.isLoggedIn) {
    primary.push({ href: "/inicio", label: "Inicio" });
  }

  if (!input.courseStarted) {
    primary.push({ href: "/onboarding", label: "Empezar" });
  } else {
    primary.push({ href: "/learn", label: "Curso" });
    if (input.showDiary) {
      primary.push({ href: "/diario", label: "Diario" });
    }
    primary.push({ href: "/progress", label: "Progreso" });
  }

  const more: AppNavLink[] = [];
  if (input.courseStarted && input.showGuide) {
    more.push({ href: "/guia", label: "Guía" });
  }
  if (input.freeMode) {
    more.push(
      { href: "/levels", label: "Repaso libre" },
      { href: "/catalog", label: "Catálogo" },
    );
  }
  if (input.courseStarted) {
    more.push({ href: "/onboarding", label: "Configuración" });
  }
  if (input.showAdmin) {
    more.push({ href: "/admin", label: "Admin" });
  }
  more.push({ href: "/profesionales", label: "Profesionales" });
  if (input.showProfessional) {
    more.push({ href: "/profesional", label: "Perfil profesional" });
  }

  const mobilePinned = input.courseStarted
    ? input.isLoggedIn
      ? [
          { href: "/inicio", label: "Inicio" },
          { href: "/learn", label: "Curso" },
          { href: "/progress", label: "Progreso" },
        ]
      : [
          { href: "/learn", label: "Curso" },
          { href: "/progress", label: "Progreso" },
        ]
    : primary.filter((link) => link.href === "/onboarding" || link.href === "/inicio");

  return { primary, more, mobilePinned };
}
