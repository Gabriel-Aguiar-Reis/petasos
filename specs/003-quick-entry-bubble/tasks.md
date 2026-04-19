# Tasks: Floating Bubble Quick Entry

## Task List

1. TSK-001: Confirmar abordagem nativa e fluxo Expo prebuild
   - Description: Validar se projeto seguirá prebuild/EAS para adicionar módulos nativos. Documentar passos de prebuild.
   - Phase: Architecture
   - Refs: FR-014, SC-001

2. TSK-002: Checklist requisitos nativos Android (manifest, perms)
   - Description: Criar checklist para manifest entries, permissions (`SYSTEM_ALERT_WINDOW`), target SDK, gradle config.
   - Phase: Architecture
   - Refs: FR-003, FR-014

3. TSK-003: Implementar `bubble-control` UI (Start/Stop)
   - Description: `src/components/bubble-control.tsx` com botões Start/Stop e representação do estado (blocked/ready/active/interrupted).
   - Phase: UI
   - Refs: FR-001, FR-004, FR-005, FR-006

4. TSK-004: Implementar fluxo de permissões e link para settings
   - Description: Checar permissões, mostrar instruções e link direto para configurar draw-over e outras permissões necessárias.
   - Phase: UI
   - Refs: FR-002, FR-003

5. TSK-005: Implementar wrapper JS `src/lib/bubble-service.ts`
   - Description: JS facade que chama o bridge nativo (Bubbles/overlay) com methods: `start`, `stop`, `show`, `hide`, `getPosition`, `setPosition`.
   - Phase: Integration
   - Refs: FR-004, FR-005, FR-011

6. TSK-006: Implementar Android native module para Bubbles (Kotlin/Java)
   - Description: Expor API para criar a bubble usando Android Bubbles API; enviar events para RN quando bubble for tocada.
   - Phase: Native
   - Refs: FR-004, FR-007

7. TSK-007: Implementar overlay fallback (draw-over) native module
   - Description: Implementar fallback que cria uma janela overlay quando Bubbles API não está disponível.
   - Phase: Native
   - Refs: FR-004, FR-007, FR-013

8. TSK-008: Quick-entry overlay UI (compact Trip/Cost)
   - Description: Reutilizar `trip-form` e `cost-form` as compact variants; present over current app when bubble tapped.
   - Phase: UI
   - Refs: FR-007, FR-008, FR-009, FR-010, SC-003

9. TSK-009: Implementar arraste e persistência de posição (AsyncStorage/DB)
   - Description: Bubble é arrastável e persiste última posição entre restarts; `src/lib/persistence.ts`.
   - Phase: UX
   - Refs: FR-011, FR-012

10. TSK-010: Gerenciar estado e interrupções
    - Description: Tratar revogação de permissão, interrupções de sistema, reinicialização do app; reconciliação de estado ao abrir controles.
    - Phase: Integration
    - Refs: FR-014, FR-006

11. TSK-011: Garantir escrita offline-first para quick-entry
    - Description: Quick-entry deve gravar em SQLite (Drizzle) localmente; não depender de rede para salvar.
    - Phase: Data
    - Refs: Constitution:I, FR-009

12. TSK-012: Tests manuais (QA checklist)
    - Description: Criar checklist cobrindo start/stop, permission flows, background behavior, quick-entry save/ dismiss.
    - Phase: QA
    - Refs: SC-001, SC-002, SC-003, SC-004, SC-005

13. TSK-013: Tests automatizados (unit/integration)
    - Description: Unit tests for `bubble-service` and integration tests for quick-entry saving to DB.
    - Phase: QA
    - Refs: FR-009, Constitution:I

14. TSK-014: Documentação e notas de release
    - Description: Document prebuild steps, permissions, testing matrix, and known limitations.
    - Phase: Docs
    - Refs: FR-015

15. TSK-015: Abrir PR com feature branch e checklist de revisão
    - Description: Prepare PR, include testing steps and verify constitution compliance.
    - Phase: Release
    - Refs: Constitution:Governance
