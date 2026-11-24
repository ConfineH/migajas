import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ClinicalExportPanel } from "@/components/ClinicalExportPanel";

const recipient = {
  professional_user_id: "22222222-2222-4222-8222-222222222222",
  share_code: "AAAAAA",
  label_id: "endocrinologia",
  title: "Endocrino/a",
  last_sent_label: "1 ene 2026",
  share_count: 1,
  preview: "Informe de ejemplo",
  can_resend: true,
  has_copies: true,
  repeat_mode: "monthly",
  repeat_due_label: "1 feb 2026",
  due: true,
};

describe("ClinicalExportPanel while sharing is suspended", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({ recipients: [recipient] }),
      ),
    );
  });

  it("keeps download, the historical recipient, and revoke, and hides send controls", async () => {
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    render(<ClinicalExportPanel />);

    expect(
      await screen.findByRole("heading", { name: "Informe para tu equipo de salud" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/El envío de informes nuevos está suspendido/),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Descargar CSV" })).toBeEnabled();
    expect(screen.getByRole("button", { name: "Descargar PDF" })).toBeEnabled();
    expect(screen.getByText("Endocrino/a")).toBeInTheDocument();
    expect(screen.getByText("Para ti es Endocrino/a.")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Preferencia guardada: todos los meses. Esta preferencia no envía un informe.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText(/Último envío: 1 ene 2026/)).toBeInTheDocument();

    expect(screen.queryByRole("button", { name: "Comprobar destinatario" })).toBeNull();
    expect(screen.queryByRole("button", { name: "Enviar al profesional" })).toBeNull();
    expect(screen.queryByRole("button", { name: /Enviar otra/ })).toBeNull();
    expect(screen.queryByLabelText("Código de tu profesional")).toBeNull();
    expect(screen.queryByRole("combobox")).toBeNull();
    expect(screen.queryByRole("checkbox")).toBeNull();
    expect(screen.queryByText(/Mandar otra vez/)).toBeNull();
    expect(screen.queryByText(/te lo recuerdo/)).toBeNull();
    expect(screen.queryByText(/enviarle otro informe/)).toBeNull();

    fireEvent.click(screen.getByRole("button", { name: "Retirar acceso" }));
    expect(confirm).toHaveBeenCalledWith(
      "¿Retirar el acceso a Endocrino/a? Se borrarán las copias que tenga.",
    );
  });

  it("explains the empty list without promising a future send", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ recipients: [] })),
    );
    render(<ClinicalExportPanel />);

    expect(
      await screen.findByText(
        "Todavía no hay destinatarios guardados. El envío de informes nuevos está suspendido.",
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Cuando envíes un informe/)).toBeNull();
  });
});
