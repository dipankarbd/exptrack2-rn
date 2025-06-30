import React from "react";

import CategoryItemView from "./CategoryItemView";

type Category = {
  id: number;
  name: string;
  parentId: number | null;
};

type Props = {
  categories: Category[];
  level: number;
  expandedIds: number[];
  toggleExpand: (id: number) => void;
  onEdit: (id: number) => void;
  getChildren: (parentId: number) => Category[];
};

export default function CategoryList({
  categories,
  level,
  expandedIds,
  toggleExpand,
  onEdit,
  getChildren,
}: Props) {
  return (
    <>
      {categories.map((cat) => (
        <CategoryItemView
          key={cat.id}
          category={cat}
          level={level}
          expandedIds={expandedIds}
          toggleExpand={toggleExpand}
          onEdit={onEdit}
          getChildren={getChildren}
          CategoryList={CategoryList}
        />
      ))}
    </>
  );
}
