export function assertAdminMutationAllowed(isPreview: boolean) {
  if (isPreview) {
    throw new Error("Las acciones de escritura están deshabilitadas en el preview de solo lectura.");
  }
}