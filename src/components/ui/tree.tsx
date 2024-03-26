import { Delete, Edit, LucideIcon, Plus, Trash2 } from 'lucide-react';
import React from 'react';
import { set } from 'react-hook-form';
import useResizeObserver from 'use-resize-observer';

import { cn } from '@/lib/utils';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './accordion';
import { Button } from './button';
import { ScrollArea } from './scroll-area';

export interface TreeNode<T extends object> {
  /** A unique key for the tree node. */
  key: Key;
  /** The key of the parent node. */
  parentKey: Key;
  /** The value object for the tree node. */
  value: T;
  /** Children of the tree node. */
  children: TreeNode<T>[];
}

export type Key = string | number;

export interface TreeProps<T extends object> extends TreeItemButtonsProps<T>, React.HTMLAttributes<HTMLDivElement> {
  items: TreeNode<T>[];
  expandedKeys: Set<Key>;
  setExpandedKeys(keys: Set<Key>): void;
}

export function Tree<T extends object>(props: TreeProps<T>) {
  const { className, expandedKeys, setExpandedKeys } = props;

  const toggleExpand = React.useCallback(
    (item: TreeNode<T>) => {
      if (expandedKeys.has(item.key)) {
        const newSet = new Set(expandedKeys);
        newSet.delete(item.key);
        setExpandedKeys(newSet);
      } else {
        const newSet = new Set(expandedKeys);
        newSet.add(item.key);
        setExpandedKeys(newSet);
      }
    },
    [expandedKeys, setExpandedKeys]
  );

  const { ref: refRoot, width, height } = useResizeObserver();

  return (
    <div ref={refRoot} className={cn('overflow-hidden', className)}>
      <ScrollArea style={{ width, height }}>
        <div className="relative p-2">
          <TreeItem toggleExpand={toggleExpand} {...props} />
        </div>
      </ScrollArea>
    </div>
  );
}

export interface TreeItemProps<T extends object>
  extends Omit<TreeProps<T>, 'setExpandedKeys'> {
  selectedItemId?: string;
  toggleExpand: (item: TreeNode<T>) => void;
}

function TreeItem<T extends object>(props: TreeItemProps<T>) {
  const {
    className,
    items,
    selectedItemId,
    toggleExpand,
    expandedKeys,
  } = props;

  return (
    <div role="tree" className={className}>
      <ul>
        {items.map((item) => (
          <li key={item.key}>
            {item.children.length ? (
              <Accordion
                type="multiple"
                defaultValue={Array.from(expandedKeys) as string[]}
              >
                <AccordionItem value={item.key.toString()}>
                  <AccordionTrigger
                    className={cn(
                      'group',
                      'px-2 hover:before:opacity-100 before:absolute before:left-0 before:w-full before:opacity-0 before:bg-muted/80 before:h-[1.75rem] before:-z-10',
                      selectedItemId === item.key &&
                        'before:opacity-100 before:bg-accent text-accent-foreground before:border-l-2 before:border-l-accent-foreground/50 dark:before:border-0'
                    )}
                    onClick={() => toggleExpand(item)}
                  >
                    <span className="text-sm truncate flex-1 text-left">
                      {(item.value as any).name}
                    </span>
                    <TreeItemButtons
                      onItemCreate={props.onItemCreate}
                      onItemEdit={props.onItemEdit}
                      onItemDelete={props.onItemDelete}
                      item={item}
                    />
                  </AccordionTrigger>
                  <AccordionContent className="pl-6">
                    <TreeItem
                      items={item.children}
                      selectedItemId={selectedItemId}
                      toggleExpand={toggleExpand}
                      expandedKeys={expandedKeys}
                      onItemCreate={props.onItemCreate}
                      onItemEdit={props.onItemEdit}
                      onItemDelete={props.onItemDelete}
                    />
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : (
              <Leaf
                item={item}
                onItemCreate={props.onItemCreate}
                onItemEdit={props.onItemEdit}
                onItemDelete={props.onItemDelete}
                onClick={() => toggleExpand(item)}
              />
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

interface LeafProps<T extends object> extends TreeItemButtonsProps<T>, React.HTMLAttributes<HTMLDivElement> {
  item: TreeNode<T>;
  isSelected?: boolean;
  Icon?: LucideIcon;
}

function Leaf<T extends object>(props: LeafProps<T>) {
  const {
    className,
    item,
    isSelected,
  } = props;
  return (
    <div
      className={cn(
        'group',
        'flex items-center py-2 px-2 cursor-pointer \
          hover:before:opacity-100 before:absolute before:left-0 before:right-1 before:w-full before:opacity-0 before:bg-muted/80 before:h-[1.75rem] before:-z-10',
        className)}
      {...props}
    >
      <span className="flex-grow text-sm truncate">{`${(item.value as any).name} - ${(item.value as any).innerValue}`}</span>
      <TreeItemButtons
        item={item}
        onItemCreate={props.onItemCreate}
        onItemDelete={props.onItemDelete}
        onItemEdit={props.onItemEdit}
      />
    </div>
  );
}

interface TreeItemButtonsProps<T extends object> {
  onItemCreate: (item: T) => void;
  onItemDelete: (item: T) => void;
  onItemEdit: (item: T) => void;
}

export function TreeItemButtons<T extends object>(
  props: TreeItemButtonsProps<T> & { item: TreeNode<T> }
) {
  return (
    <>
      <Button
        variant="destructive"
        size="sm"
        className="mr-1 invisible group-hover:visible"
        onClick={(e) => {
          props.onItemDelete(props.item.value);
          e.stopPropagation();
        }}
      >
        <Trash2 />
      </Button>
      <Button
        variant="outline"
        size="sm"
        className="mr-1 invisible group-hover:visible"
        onClick={(e) => {
          props.onItemEdit(props.item.value);
          e.stopPropagation();
        }}
      >
        <Edit />
      </Button>
      <Button
        className="mr-4 invisible group-hover:visible"
        variant="outline"
        size="sm"
        onClick={(e) => {
          props.onItemCreate(props.item.value);
          e.stopPropagation();
        }}
      >
        <Plus />
      </Button>
    </>
  );
}
