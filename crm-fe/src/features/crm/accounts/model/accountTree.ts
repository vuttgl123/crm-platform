import { AccountSummaryResponse, AccountTreeNode } from './accountTypes';

export interface FlattenedAccountNode {
  node: AccountTreeNode;
  hasChildren: boolean;
  childCount: number;
  totalDescendants: number;
}

export function buildAccountTree(
  accounts: AccountSummaryResponse[]
): AccountTreeNode[] {
  const accountMap = new Map<string, AccountSummaryResponse>();
  accounts.forEach((acc) => accountMap.set(acc.id, acc));

  const childrenMap = new Map<string, AccountSummaryResponse[]>();
  const rootAccounts: AccountSummaryResponse[] = [];

  // Group into roots vs children
  accounts.forEach((acc) => {
    if (acc.parentAccountId && accountMap.has(acc.parentAccountId)) {
      const existing = childrenMap.get(acc.parentAccountId) || [];
      existing.push(acc);
      childrenMap.set(acc.parentAccountId, existing);
    } else {
      rootAccounts.push(acc);
    }
  });

  function buildNode(
    acc: AccountSummaryResponse,
    level: number,
    visited: Set<string>
  ): AccountTreeNode {
    visited.add(acc.id);
    const childAccounts = childrenMap.get(acc.id) || [];
    const children: AccountTreeNode[] = [];

    for (const child of childAccounts) {
      if (!visited.has(child.id)) {
        children.push(buildNode(child, level + 1, new Set(visited)));
      }
    }

    return {
      account: acc,
      children,
      level,
    };
  }

  return rootAccounts.map((root) => buildNode(root, 0, new Set()));
}

export function flattenAccountTree(
  tree: AccountTreeNode[],
  expandedIds: Set<string>
): FlattenedAccountNode[] {
  const result: FlattenedAccountNode[] = [];

  function countDescendants(node: AccountTreeNode): number {
    let count = node.children.length;
    for (const child of node.children) {
      count += countDescendants(child);
    }
    return count;
  }

  function traverse(node: AccountTreeNode) {
    const hasChildren = node.children.length > 0;
    const childCount = node.children.length;
    const totalDescendants = countDescendants(node);

    result.push({
      node,
      hasChildren,
      childCount,
      totalDescendants,
    });

    if (hasChildren && expandedIds.has(node.account.id)) {
      for (const child of node.children) {
        traverse(child);
      }
    }
  }

  tree.forEach(traverse);
  return result;
}

export function getAllParentNodeIds(accounts: AccountSummaryResponse[]): string[] {
  const parentIds = new Set<string>();
  accounts.forEach((acc) => {
    if (acc.parentAccountId) {
      parentIds.add(acc.parentAccountId);
    }
  });
  return Array.from(parentIds);
}
