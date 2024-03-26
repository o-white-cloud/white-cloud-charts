export function createTreeItemId(parentId: string, siblings: { id: string }[]) {
    const maxSiblingId = siblings
      .map((x) => Number(x.id.substring(x.id.lastIndexOf('.') + 1)))
      .reduce((m, x) => Math.max(m, x), -1);
    return `${parentId}${parentId ? '.' : ''}${maxSiblingId + 1}`;
  }