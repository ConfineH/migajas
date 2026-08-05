# Migajas — Dossier para decisión institucional

**Audiencia:** dirección de cuidados, gerencia de atención primaria, innovación en salud digital, unidad de contratación.  
**Extensión:** 3–4 páginas · Complementa [B2G-ONEPAGER-CCAA.md](../B2G-ONEPAGER-CCAA.md).

---

## 1. Propuesta en una página

| | |
|--|--|
| **Qué** | App web educativa de conteo de carbohidratos con comida española |
| **Para quién** | Pacientes en educación diabetológica (gratuito para el usuario si licencia el servicio) |
| **Problema** | Educación presencial limitada en tiempo; dificultad práctica con raciones y platos mixtos |
| **Solución** | Curso 5 niveles + práctica + examen; catálogo regional; informe educativo opt-in |
| **Qué no es** | Telemonitorización, calculadora de insulina, integración EHR (Fase 1) |
| **Modelo** | Licencia territorial + implantación + formación + soporte 12–36 meses |
| **Entrada recomendada** | Piloto 6 meses en 2–5 centros de AP |

---

## 2. Por qué ahora

### Presión asistencial documentada

- Todas las CCAA tienen programas de paciente activo / escuelas de pacientes, pero **no todas** tienen herramienta digital estructurada para conteo de HC.  
- Barreras frecuentes en educación diabetológica: **falta de tiempo en consulta**, programas no sistematizados, **desigualdad** entre territorios urbanos y rurales ([revisión AP enfermería](https://revistasanitariadeinvestigacion.com/educacion-para-el-autocuidado-en-personas-con-diabetes-mellitus-tipo-2-revision-bibliografica-desde-la-practica-enfermera-en-atencion-primaria/), [desigualdades educación diabetológica](http://diabetespractica.com/files/136/art3.pdf)).

### Hueco que ocupa Migajas

| Inversión regional típica | Migajas |
|---------------------------|---------|
| Telemonitorización clínica (Madrid ~3,5 M€ IoMT) | Capa **educativa previa/complementaria** |
| Desarrollo a medida (Galicia → SERGAS) | Producto listo, despliegue en semanas |
| Folletos y vídeos sueltos | Curso secuencial con métricas de uso |

---

## 3. Precedentes en España (resumen)

| Caso | Relevancia |
|------|------------|
| **PACAS Asturias** — licencia + app móvil educativa (~115 k€ / 36 meses) | Modelo contractual directo |
| **SERGAS Galicia** — autocontrol diabetes (desarrollo) | Demanda pública explícita |
| **DiabeCyL (CyL)** — app gratuita con apoyo Sacyl | Modelo convenio + validación clínica |
| **ProEmpower (Murcia)** — PCP autocuidado DM2 | Innovación europea en la CCAA |
| **17 CCAA** — escuelas de pacientes / paciente activo | Canal de distribución existente |

Detalle y enlaces: [B2G-ONEPAGER-CCAA.md](../B2G-ONEPAGER-CCAA.md).

---

## 4. Paquete y coste orientativo

| Módulo | Contenido |
|--------|-----------|
| Licencia territorial | Uso en la CCAA o subterritorio acordado |
| Implantación | Despliegue, admins, dominio opcional |
| Adaptación | Validación catálogo con referentes locales |
| Formación | Sesión(es) a educadores / enfermería referente |
| Soporte | 12–36 meses |
| Reporting | Métricas agregadas anonimizadas |

| Escenario | Rango orientativo |
|-----------|-------------------|
| **Piloto 6 meses** (2–5 centros, ~500 usuarios) | 15.000 – 35.000 € |
| **Despliegue CCAA 3 años** | 60.000 – 120.000 € |
| **Mantenimiento anual** posterior | 8.000 – 18.000 € |

*No vinculante; ajustar tras alcance y umbral de contratación.*

---

## 5. Piloto propuesto (6 meses)

| Fase | Actividad | Entregable |
|------|-----------|------------|
| **M0** | Convenio / contrato menor | Firmado |
| **M1** | Formación a 10–20 referentes | Material [KIT-PROFESIONAL](./KIT-PROFESIONAL.md) |
| **M2–M5** | Uso en centros piloto; soporte | Incidencias resueltas |
| **M6** | Informe de impacto | Informe dirección |

### KPIs del piloto

- Usuarios registrados ≥ 200  
- ≥ 40 % completan Nivel 1  
- ≥ 3 centros con recomendación activa documentada  
- Encuesta breve de satisfacción (opcional)

**Sin** prometer reducción de HbA1c en materiales del piloto salvo que el servicio diseñe estudio clínico aparte.

---

## 6. Gobernanza y datos

| Tema | Enfoque Fase 1 |
|------|----------------|
| **RGPD** | Alojamiento UE; política de privacidad del licenciatario |
| **Datos clínicos** | No se recogen glucosa ni dosis de insulina |
| **Diario opt-in** | Solo si el usuario activa modo seguimiento (nivel 3+) |
| **Métricas admin** | Agregadas; sin acceso a diarios individuales por defecto |
| **MDR** | Posicionamiento educativo; ver [MDR-POSITION.md](../LEGAL/MDR-POSITION.md) |

---

## 7. Implementación (esfuerzo interno)

| Área | Esfuerzo estimado |
|------|-------------------|
| Educación diabetológica | 1 referente + 2 h/semana en piloto |
| IT del servicio | Bajo (web, sin VPN ni EHR) |
| Contratación | Contrato menor o licitación según importe |
| Comunicación interna | QR en centros piloto + [KIT-PACIENTE](./KIT-PACIENTE.md) |

**No requiere** proyecto de integración con historia clínica en Fase 1.

---

## 8. Riesgos y mitigaciones

| Riesgo | Mitigación |
|--------|------------|
| Baja adopción | Formación a referentes; QR en consulta de educación DM |
| Brecha digital (mayores) | Uso en tablet del centro; acompañamiento en taller |
| Confusión con app clínica | Mensaje claro: educativa, no insulina |
| Saturación de apps | Un solo curso oficial del piloto, no más herramientas en paralelo |

---

## 9. Decisión solicitada

1. **Aprobar piloto** en `[N]` centros de `[GERENCIA/AP]`.  
2. **Designar referente** de educación diabetológica.  
3. **Autorizar** uso de nombre del servicio en materiales ([kits](./README.md)).  
4. **Reunión de kick-off** (60 min) con equipo Migajas / licenciatario.

---

## 10. Contacto

`[NOMBRE]` · `[CARGO]` · `[EMAIL]` · `[TELÉFONO]`  
Demo en vivo: `[URL_MIGAJAS]`  
Mapa de compradores CCAA: [B2G-BUYERS-MAP-ES.md](../B2G-BUYERS-MAP-ES.md)

---

*Dossier institucional · Migajas · Versión 0.1 · [FECHA]*
