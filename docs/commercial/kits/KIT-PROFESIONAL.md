# Migajas — Guía para profesionales sanitarios

**Audiencia:** enfermería de atención primaria, educadores en diabetes, endocrinología, nutrición clínica.  
**Versión:** 0.1 · Uso interno del servicio de salud licenciatario.

---

## Resumen en 30 segundos

**Migajas** es una herramienta **educativa** web para que las personas aprendan a **relacionar alimentos, gramos de carbohidratos y raciones** (10 g HC = 1 ración en España), con un curso estructurado de 5 niveles y comida localizada.

- **Complementa** la educación diabetológica presencial; no la sustituye.  
- **No** es dispositivo médico, **no** calcula insulina, **no** se integra con la historia clínica (Fase 1).  
- El paciente puede, tras el nivel 3, activar un diario educativo opt-in y exportar informes **si él lo decide**.
- **El modo clínico no realiza recomendaciones terapéuticas ni cálculos de dosis de insulina**; es registro y exportación opcionales.
- Para aprobar un nivel hace falta **≥ 70 %** de aciertos en el examen (reintentos permitidos).

---

## ¿Cuándo recomendarla?

| Situación | Recomendación |
|-----------|---------------|
| Tras diagnóstico o inicio de educación en HC | Nivel 1 como refuerzo entre talleres |
| Paciente con dificultad en estimación de raciones | Niveles 2–4 (cereales, platos mixtos, comer fuera) |
| Zona rural / poca oferta presencial | Curso autónomo + revisión en consulta |
| Repaso antes de cambio de patrón alimentario | Niveles según necesidad |
| Paciente que evita HC por desconocimiento | Nivel 1 + práctica guiada (no culpabilizar) |

**Precaución:** en pacientes con trastorno alimentario activo o fijación obsesiva con la comida, valorar individualmente si un registro o conteo estructurado es adecuado (ver [pain points](../research/PAIN-POINTS-EDUCACION-DM.md)).

---

## Qué aprende el paciente (por nivel)

| Nivel | Contenidos principales | Habilidad esperada |
|-------|------------------------|-------------------|
| **1 — Fundamentos** | Ración (10 g HC), etiquetas, fibra, alimentos básicos | Identificar HC en alimentos simples |
| **2 — Cereales y legumbres** | Arroz, pasta, patata, legumbres | Estimar raciones en guarniciones |
| **3 — Verduras y frutas** | Qué cuenta y qué no; frutas densas | Separar componentes del plato |
| **4 — Platos mixtos** | Cocina española, restaurante, tapas | Desglosar platos compuestos |
| **5 — Vida real** | Menús completos, alcohol, celebraciones | Integrar en contexto social |

Cada nivel exige **práctica aprobada** y **examen** antes de avanzar.

---

## Flujo para el paciente (lo que debe hacer)

1. Acceder a `[URL_MIGAJAS]` (enlace o QR del centro).  
2. Registrarse o continuar como invitado (cuenta recomendada).  
3. Completar onboarding (país = España).  
4. Seguir ruta **Aprender** → lección → práctica → examen de nivel.  
5. *(Opcional, nivel 3+)* Activar seguimiento personal y exportar informe para la consulta.

**Tiempo orientativo:** 15–25 min por sesión; curso completo en varias semanas.

---

## Qué puede hacer el profesional

| Puede | No puede (v1) |
|-------|----------------|
| Recomendar la URL / QR | Ver progreso individual del paciente en tiempo real |
| Preguntar en consulta qué nivel ha completado | Recibir datos automáticos en la historia clínica |
| Revisar informe PDF/CSV **si el paciente lo trae** | Modificar el plan terapéutico desde la app |
| Solicitar métricas **agregadas** al administrador del piloto | Acceder al diario sin consentimiento del paciente |

En pilotos institucionales, la dirección del programa puede recibir informes agregados (usuarios activos, % nivel 1 completado) **sin datos personales**.

---

## Cómo introducirla en la consulta (guion breve)

> *«Te recomiendo Migajas, un curso online gratuito para practicar el conteo de carbohidratos con comida de aquí. No sustituye lo que hablamos hoy, pero te ayuda a practicar entre visitas. Empieza por el Nivel 1; en la próxima consulta me cuentas cómo te va o me traes el informe si activas el seguimiento.»*

**Material de apoyo:** entregar [KIT-PACIENTE.md](./KIT-PACIENTE.md) impreso o por email.

---

## Preguntas frecuentes (profesionales)

**¿Sustituye al educador en diabetes?**  
No. Estandariza la parte práctica del conteo de HC; el vínculo y la personalización siguen en consulta.

**¿Calcula bolos de insulina?**  
No. Es exclusivamente educativa.

**¿Es válida para diabetes tipo 2 sin insulina?**  
Sí. El foco es alfabetización en carbohidratos, no el ajuste de medicación.

**¿Y si el paciente no tiene smartphone?**  
Funciona en navegador de ordenador o tablet; no requiere instalación.

**¿Los alimentos son de España?**  
Sí en despliegue ES (10 g = 1 ración). Existe configuración para otros territorios licenciados.

**¿Quién responde dudas clínicas dentro de la app?**  
Nadie. Las dudas de tratamiento deben canalizarse al equipo de salud.

---

## Posicionamiento regulatorio

- Categoría: **educación en salud / formación del paciente**.  
- No CE como dispositivo médico en comunicación comercial.  
- Modo clínico = auto-seguimiento educativo voluntario, no monitorización.  
- Detalle: [MDR-POSITION.md](../LEGAL/MDR-POSITION.md).

---

## Contacto interno del programa

| Rol | Contacto |
|-----|----------|
| Referente educación diabetológica | `[REFERENTE_EDUCACION]` |
| Soporte técnico app | `[EMAIL_SOPORTE]` |
| Administrador de contenido / piloto | `[ADMIN_PROGRAMA]` |

---

## Frases que **no** usar con pacientes

Evitar (marketing prohibido en Migajas):

- «Controla tu diabetes con esta app»  
- «Calcula la insulina que necesitas»  
- «Es facilísimo, no puedes fallar»

Preferir:

- «Practica el conteo con comida real»  
- «Ve a tu ritmo, sin prisa»  
- «Trae dudas a la próxima consulta»

---

*Documento para personal sanitario · [NOMBRE_LICENCIATARIO] · Versión 0.1*
