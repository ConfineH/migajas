# Migajas — Dossier decisión institucional (Comunidad de Madrid)

**Audiencia:** Consejería de Sanidad, Dirección General de Cuidados / Atención Primaria, Dirección General de Salud Digital (Consejería de Digitalización), gerencias SERMAS, unidad de contratación.  
**Versión:** Madrid 0.1 · Jul 2026

---

## 1. Propuesta (Madrid)

| | |
|--|--|
| **Qué** | Curso web educativo de conteo de carbohidratos con comida española |
| **Quién lo usa** | Pacientes en educación diabetológica SERMAS (gratuito para el usuario si licencia el servicio) |
| **Problema local** | Alta demanda de educación DM; tiempo limitado en AP; platos mixtos y comer fuera como punto de fricción |
| **Solución** | 5 niveles + práctica + examen; refuerzo entre talleres Escuela Madrileña de Salud |
| **Qué no es** | Telemonitorización IoMT, calculadora de insulina, integración Tarjeta Sanitaria Virtual (Fase 1) |
| **Entrada** | **Piloto 6 meses** en 2–3 centros de AP de una gerencia |

---

## 2. Por qué Madrid, por qué ahora

### Contexto asistencial

- La Comunidad de Madrid concentra una de las mayores poblaciones con diabetes del país.  
- Existe **Escuela Madrileña de Salud** con contenido de autocuidado en diabetes ([web oficial](https://www.comunidad.madrid/salud/escuela-madrilena-salud)).  
- **Asociación Diabetes Madrid** articula educación presencial y digital con amplia trayectoria ([diabetesmadrid.org](https://diabetesmadrid.org/)).  
- La Consejería de Digitalización despliega **telemonitorización** (IoMT, glucosa continua, ~3,5 M€ NextGenEU) — inversión en **monitorización clínica**, no en formación estructurada en conteo de HC.

### Hueco que ocupa Migajas

| Inversión Madrid reciente | Migajas |
|---------------------------|---------|
| Plataforma IoMT / telemonitorización | Educación **previa y complementaria** |
| Contenido web Escuela Madrileña (información) | Curso **secuencial** con práctica y métricas |
| Talleres presenciales (capacidad limitada) | Práctica **entre sesiones**, escalable |

**No duplicar mensaje:** Migajas no sustituye IoMT ni la historia clínica digital.

---

## 3. Precedentes aplicables (fuera y dentro de Madrid)

| Precedente | Lección para Madrid |
|------------|---------------------|
| **PACAS Asturias** — licencia + app educativa ~115 k€/36 meses | Modelo de contrato «licencia + app + formación» |
| **SERGAS Galicia** — licitación autocontrol diabetes | Demanda pública de digital en diabetes |
| **DiabeCyL + Sacyl** | Convenio + validación + difusión desde AP |
| **ADM + Escuela Madrileña** — talleres conjuntos | Canal de distribución ya existente en Madrid |
| **IoMT Madrid 2025** | Presupuesto digital existe; hueco educativo específico sin cubrir |

---

## 4. Propuesta de piloto Madrid (6 meses)

### Diseño

| Parámetro | Propuesta |
|-----------|-----------|
| **Gerencia** | Una gerencia de AP (p. ej. Madrid o metropolitana) |
| **Centros** | 2–3 centros de salud con educación diabetológica activa |
| **Usuarios objetivo** | 200–500 registrados |
| **Referente SERMAS** | 1 enfermera/o referente educación DM + enlace Escuela Madrileña de Salud |
| **Aliado opcional** | Asociación Diabetes Madrid (QR en talleres, sin exclusividad) |
| **URL** | `https://migajas.vercel.app/onboarding?region=es` (+ dominio institucional opcional Fase 2) |

### Cronograma

| Mes | Actividad |
|-----|-----------|
| **M0** | Convenio marco o contrato menor |
| **M1** | Formación 10–15 referentes ([KIT-PROFESIONAL](./KIT-PROFESIONAL.md)) |
| **M2–M5** | Recomendación activa en consulta; soporte; materiales en centros |
| **M6** | Informe agregado a dirección de cuidados / gerencia |

### KPIs

- ≥ 200 usuarios registrados en ámbito piloto  
- ≥ 40 % completan Nivel 1  
- ≥ 3 centros con protocolo de recomendación documentado  
- Encuesta breve satisfacción (opcional)

---

## 5. Paquete y presupuesto orientativo

| Escenario Madrid | Rango |
|------------------|-------|
| **Piloto 6 meses** (2–3 centros AP) | **15.000 – 35.000 €** |
| **Despliegue comunidad 3 años** (post-piloto) | 60.000 – 120.000 € |
| **Mantenimiento anual** | 8.000 – 18.000 € |

Incluye: licencia uso Madrid, implantación, adaptación catálogo, formación referentes, soporte, informes agregados.

**Vía de contratación probable:** contrato menor o convenio de colaboración si importe bajo umbral; licitación si despliegue autonómico completo. Portal: [contratos-publicos.comunidad.madrid](https://contratos-publicos.comunidad.madrid/).

---

## 6. Gobernanza, datos y mensaje público

| Tema | Enfoque |
|------|---------|
| **RGPD** | Alojamiento UE; DPA con licenciatario |
| **Historia clínica / TSV** | Sin integración Fase 1 |
| **Datos clínicos** | No glucosa ni insulina en la app |
| **Diario opt-in** | Solo nivel 3+, exportación voluntaria por el paciente |
| **Métricas admin** | Agregadas; sin acceso a diarios individuales |
| **Comunicación** | «Herramienta educativa del piloto» — no «app del SERMAS» hasta acuerdo de marca |

---

## 7. Esfuerzo interno SERMAS

| Área | Carga estimada piloto |
|------|------------------------|
| Educación diabetológica | 1 referente, ~2 h/semana |
| IT hospitalaria / gerencia | Mínima (web pública, sin VPN) |
| Comunicación interna | QR + [KIT-PACIENTE](./KIT-PACIENTE.md) en 2–3 centros |
| Contratación | Según importe y umbral CM |

---

## 8. Riesgos y mitigaciones (específicos Madrid)

| Riesgo | Mitigación |
|--------|------------|
| Confusión con IoMT / telemonitorización | Mensaje diferenciado en formación y materiales |
| «Otra app más» para el paciente | Un solo curso oficial del piloto; QR solo en educación DM |
| Baja adopción mayores | Tablet en centro; acompañamiento en taller |
| Expectativa de integración TSV | Comunicar desde día 1: Fase 1 sin integración |
| Dependencia de ADM | Aliado opcional, no único canal |

---

## 9. Decisiones solicitadas

1. **Aprobar piloto** en `[GERENCIA AP]` — centros: `[LISTA]`.  
2. **Designar referente** educación diabetológica (`[REFERENTE_SERMAS]`).  
3. **Autorizar materiales** con mención SERMAS / piloto.  
4. **Kick-off** 60 min (Migajas + referente + dirección AP).  
5. *(Opcional)* Carta de apoyo o difusión con **Asociación Diabetes Madrid**.

---

## 10. Contacto

`[NOMBRE]` · `[CARGO]` · `[EMAIL]` · `[TELÉFONO]`  
Demo: https://migajas.vercel.app  
Mapa compradores: [B2G-BUYERS-MAP-ES.md](../../B2G-BUYERS-MAP-ES.md) (fila Madrid)

---

*Dossier piloto Migajas — Comunidad de Madrid · Versión 0.1*
