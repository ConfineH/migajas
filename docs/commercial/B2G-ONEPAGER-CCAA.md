# Migajas — One-pager B2G para Comunidades Autónomas (España)

**Documento comercial interno** · Versión 0.1 · Jul 2026  
**Uso:** reuniones con consejerías, servicios de salud, educación diabetológica y atención primaria.  
**Relacionado:** [README-BUYER.md](./README-BUYER.md) · [B2G-BUYERS-MAP-ES.md](./B2G-BUYERS-MAP-ES.md)

---

## En una frase

**Migajas** es una aplicación web educativa que enseña a **contar carbohidratos con comida real española**, mediante un curso guiado de 5 niveles, práctica y autoevaluación — complemento digital a los programas de educación diabetológica y paciente activo ya existentes en cada CCAA.

---

## El problema

| Reto | Contexto |
|------|----------|
| **Educación dispersa** | Folletos, vídeos y talleres presenciales no escalan ni se retienen igual en zonas rurales |
| **Brecha práctica** | Relacionar gramos de alimento, gramos de HC y raciones con platos cotidianos sigue siendo el punto de fricción en educación diabetológica |
| **Desigualdad territorial** | Todas las CCAA tienen programas de paciente activo / escuelas de pacientes, pero no todas tienen una herramienta digital estructurada y localizada |
| **Presión asistencial** | Más pacientes con diabetes, mismos recursos en atención primaria |

Migajas **no sustituye** al educador ni al equipo de salud. Refuerza el aprendizaje entre consultas y estandariza un módulo práctico (conteo de HC con comida española).

---

## La solución

| Componente | Descripción |
|------------|-------------|
| **Curso guiado** | 5 niveles: de conceptos básicos a platos mixtos y lectura de etiquetas |
| **Catálogo regional** | ~80 alimentos habituales en España; regla **10 g HC = 1 ración** |
| **Práctica + examen** | Autoevaluación antes de avanzar; progreso sincronizado |
| **Modo clínico (opt-in)** | Diario educativo + exportación CSV/PDF para compartir con el equipo de salud (nivel 3+) |
| **Panel admin** | Gestión de contenido y métricas agregadas anónimas |
| **Acceso** | Web responsive; sin instalación; gratuito para el usuario final vía licencia institucional |

**Posicionamiento regulatorio:** herramienta **educativa**, no dispositivo médico, no calculadora de insulina, no monitorización clínica. Ver [MDR-POSITION.md](./LEGAL/MDR-POSITION.md).

---

## ¿Para quién dentro de la CCAA?

| Área | Rol |
|------|-----|
| **Educación diabetológica / Enfermería AP** | Recomienda y hace seguimiento del progreso formativo |
| **Programa Paciente Activo / Escuela de Pacientes** | Migajas como módulo digital de apoyo entre talleres |
| **Dirección de Cuidados / Humanización** | Coherencia con estrategias de autocuidado |
| **Innovación / Salud digital** | Piloto medible sin integración con historia clínica (Fase 1) |
| **Contratación** | Paquete de licencia + implantación + mantenimiento (ver abajo) |

**Comprador típico:** Consejería de Salud o servicio regional de salud (SERGAS, Sacyl, SERMAS, etc.), no el Ministerio central.

---

## Precedentes públicos en España (por qué encaja)

No existe una licitación idéntica a *"app de conteo de carbohidratos"*, pero sí contratos y programas **muy cercanos**:

| Precedente | Qué demuestra | Referencia |
|------------|---------------|------------|
| **PACAS Asturias** | Contrato explícito de **licencias de uso + app móvil educativa** para programa Paciente Activo y Escuela de Salud (~115.600 € / 36 meses) | [contrataciondelestado.es — memoria PACAS](https://contrataciondelestado.es/wps/wcm/connect/PLACE_es/Site/area/docAccCmpnt?DocumentIdParam=76cd510c-fbc7-43a9-b406-3ea12c780788) |
| **SERGAS Galicia** | Licitación de **solución para autocontrol de la diabetes** (desarrollo + demostración) | [EU tenders — SERGAS](https://op.europa.eu/en/web/public-procurement/procurement-details/-/procurement/3bc25d73-f34b-3e8f-b1ae-3725fa3b5f9f) |
| **ProEmpower (Murcia)** | Compra pública precomercial de ICT para **autogestión diabetes tipo 2** en 4 países EU | [Ministerio de Sanidad — ficha Murcia](https://www.sanidad.gob.es/profesionales/innovacionSanitaria/CCAA/docs/FICHA_MURCIA_ProEMPOWER.pdf) |
| **DiabeCyL** | App gratuita de educación diabetológica con **apoyo institucional** de Sacyl (modelo convenio + validación clínica, no solo licitación) | [El Norte de Castilla — DiabeCyL](https://www.elnortedecastilla.es/castillayleon/castilla-leon-crea-20220507210357-nt.html) |
| **Escuelas de pacientes (17 CCAA)** | Marco nacional de educación en diabetes; casi todas las autonomías tienen programa activo | [Plataforma de Pacientes — mapa programas (2024)](https://plataformadepacientes.org/wp-content/uploads/2024/03/programa_educacion_sanitaria_def.pdf) |

**Nota estratégica:** Madrid invierte en **telemonitorización clínica** (IoMT, glucosa continua, ~3,5 M€). Migajas ocupa el hueco **educativo previo/complementario**, no compite con Indra ni con plataformas clínicas.

---

## Paquete institucional propuesto

Evitar vender solo *"licencia perpetua"* en el pitch. El sector público compra **servicios + suministro**:

| Módulo | Contenido |
|--------|-----------|
| **A. Licencia territorial** | Derecho de uso en la CCAA (o subterritorio acordado); configuración `region=es` |
| **B. Implantación** | Despliegue, dominio institucional opcional, onboarding de administradores |
| **C. Adaptación de contenidos** | Validación de catálogo de alimentos y ejemplos con equipo local (como en PACAS) |
| **D. Formación** | Sesión(es) a educadores diabetológicos / enfermería de AP |
| **E. Soporte y mantenimiento** | 12–36 meses: incidencias, actualizaciones de contenido menores, documentación |
| **F. Métricas de impacto** | Informe agregado anónimo: registros, niveles completados, uso por zona (sin datos clínicos) |

**Fuera de alcance Fase 1:** integración con historia clínica, apps nativas, IA de reconocimiento de imágenes.

---

## Precio orientativo (España, una CCAA)

Basado en órdenes de magnitud de contratos similares (PACAS, desarrollos educativos regionales). **No es oferta vinculante** — ajustar tras piloto y alcance.

| Escenario | Alcance | Rango orientativo |
|-----------|---------|-------------------|
| **Piloto** | 2–5 centros de salud, 6 meses, hasta ~500 usuarios | **15.000 – 35.000 €** |
| **Despliegue CCAA** | Licencia + implantación + formación + 36 meses soporte | **60.000 – 120.000 €** |
| **Mantenimiento anual** (post-contrato) | Soporte, parches, informe de uso | **8.000 – 18.000 €/año** |

Comparación interna: PACAS Asturias ≈ **115.600 € / 3 años** (plataforma + app + adaptación + formación).

**Argumento de coste:** Migajas evita licitar **desarrollo a medida** (SERGAS → Indra) para un módulo educativo ya construido y localizado.

---

## Métricas de impacto (para memoria justificativa)

| Métrica | Uso |
|---------|-----|
| Usuarios registrados en el territorio | Volumen de adopción |
| % que completa nivel 1 y nivel 3 | Retención y profundidad |
| Tiempo medio por lección | Engagement |
| Centros de salud que recomiendan la herramienta | Penetración asistencial |
| Encuesta breve post-nivel (opcional) | Satisfacción / claridad percibida |

Sin prometer mejoras clínicas (HbA1c, etc.) en marketing — solo en estudios piloto si el comprador lo diseña.

---

## Propuesta de entrada: piloto 6 meses

1. **Mes 0:** Convenio marco o contrato menor según umbral de la CCAA  
2. **Mes 1:** Formación a 10–20 educadores / referentes de enfermería  
3. **Meses 2–5:** Uso en 2–5 centros piloto; soporte y ajustes de contenido  
4. **Mes 6:** Informe de impacto + decisión de despliegue autonómico  

**Entregable mínimo del piloto:** 200+ usuarios activos, 40%+ completan nivel 1, informe para dirección de cuidados.

---

## Diferenciadores frente a alternativas

| Alternativa | Limitación | Migajas |
|-------------|------------|---------|
| Folletos / vídeos sueltos | No estructurado, sin seguimiento | Curso secuencial + práctica |
| Desarrollo a medida (gran integrador) | Caro, lento, mantenimiento pesado | Producto listo, especializado |
| Apps genéricas de nutrición | No localizadas, no método de raciones ES | Comida española, 10 g = 1 ración |
| Telemonitorización (IoMT) | Clínico, no formativo en conteo de HC | Educativo, complementario |
| DiabeCyL y similares | Vídeos, menos interactividad | Curso + ejercicios + examen |

---

## Compliance y datos

- RGPD / LOPDGDD; alojamiento UE negociable  
- Modo clínico y diario: **opt-in** explícito  
- Sin claims de tratamiento ni control glucémico en materiales comerciales  
- Documentación legal disponible en `docs/commercial/LEGAL/`

---

## Próximo paso

**Reunión de 30 min** con educación diabetológica o innovación en salud para:

1. Demo del curso (15 min)  
2. Encaje con programa Paciente Activo / Escuela de Pacientes de la CCAA  
3. Definición de piloto en 2–5 centros  

---

## Contacto

`[NOMBRE DEL LICENCIANTE]`  
`[EMAIL]`  
`[TELÉFONO]`  
Demo: `https://migajas.vercel.app`

---

## Anexo: frases útiles en reunión

- *"No sustituimos al educador; le damos una herramienta que el paciente puede usar entre talleres."*  
- *"Asturias ya licitó licencia + app educativa para Paciente Activo; nosotros ofrecemos algo equivalente, especializado en conteo de carbohidratos con comida española."*  
- *"No competimos con la telemonitorización de glucosa; somos la capa formativa previa."*  
- *"El usuario no paga; la CCAA licencia el territorio."*
