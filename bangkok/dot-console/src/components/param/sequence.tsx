import { Button, IconButton } from "../ui";
import { CodecParam } from "./codec";
import {
  INCOMPLETE,
  INVALID,
  type ParamInput,
  type ParamProps,
} from "./common";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToVerticalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type {
  SequenceDecoded,
  SequenceShape,
} from "@polkadot-api/view-builder";
import AddIcon from "@w3f/polkadot-icons/solid/Add";
import CloseIcon from "@w3f/polkadot-icons/solid/Close";
import MoreMenuIcon from "@w3f/polkadot-icons/solid/MoreMenu";
import { type PropsWithChildren, useEffect, useMemo, useState } from "react";
import { css } from "styled-system/css";

export type SequenceParamProps<T> = ParamProps<T[]> & {
  sequence: SequenceShape;
  defaultValue: SequenceDecoded | undefined;
};

type SortableValue<T> = {
  id: string;
  value: T;
};

export function SequenceParam<T>({
  sequence,
  defaultValue,
  onChangeValue,
}: SequenceParamProps<T>) {
  const [length, setLength] = useState(defaultValue?.value.length ?? 1);

  const [sortableValues, setSortableValues] = useState(
    Array.from({ length }).map(
      (): SortableValue<ParamInput<T>> => ({
        id: globalThis.crypto.randomUUID(),
        value: INCOMPLETE,
      }),
    ),
  );

  const values = useMemo(
    () => sortableValues.map((value) => value.value),
    [sortableValues],
  );

  const derivedValue = useMemo(
    () =>
      values.includes(INCOMPLETE)
        ? INCOMPLETE
        : values.includes(INVALID)
          ? INVALID
          : (values as T[]),
    [values],
  );

  const increaseLength = () => {
    setLength((length) => length + 1);
    setSortableValues((value) => [
      ...value,
      { id: globalThis.crypto.randomUUID(), value: INCOMPLETE },
    ]);
  };

  useEffect(
    () => {
      onChangeValue(derivedValue);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [derivedValue],
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  return (
    <div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        modifiers={[restrictToVerticalAxis]}
        onDragEnd={({ active, over }) => {
          if (over !== null && active.id !== over.id) {
            setSortableValues((items) => {
              const oldIndex = items.findIndex((item) => item.id === active.id);
              const newIndex = items.findIndex((item) => item.id === over.id);

              return arrayMove(items, oldIndex, newIndex);
            });
          }
        }}
      >
        <SortableContext
          items={sortableValues}
          strategy={verticalListSortingStrategy}
        >
          {sortableValues.map((item, index, array) => (
            <SortableItem
              key={item.id}
              id={item.id}
              sortable={array.length > 1}
              onRequestRemove={() =>
                setSortableValues((values) =>
                  values.filter((value) => value.id !== item.id),
                )
              }
            >
              <CodecParam
                shape={sequence.shape}
                defaultValue={defaultValue?.value.at(index)}
                onChangeValue={(value) =>
                  setSortableValues((array) =>
                    array.with(index, {
                      id: array[index]!.id,
                      value: value as ParamInput<T>,
                    }),
                  )
                }
              />
            </SortableItem>
          ))}
        </SortableContext>
      </DndContext>
      <div
        className={css({
          display: "flex",
          gap: "0.5rem",
          marginTop: "0.5rem",
        })}
      >
        <Button size="xs" onClick={increaseLength}>
          Add item <AddIcon fill="currentcolor" />
        </Button>
      </div>
    </div>
  );
}

type SortableItemProps = PropsWithChildren<{
  id: string;
  sortable?: boolean;
  onRequestRemove: () => void;
}>;

export function SortableItem({
  id,
  sortable,
  onRequestRemove,
  children,
}: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      style={style}
      className={css({
        display: "flex",
        // gap: "0.5rem",
        "&>*:first-child": { flex: 1 },
      })}
    >
      {children}
      <div
        className={css({
          display: "flex",
          flexDirection: "column",
        })}
      >
        {sortable && (
          <IconButton
            ref={setNodeRef}
            variant="ghost"
            size="xs"
            className={css({
              cursor: "grab",
              "&:active:hover": { cursor: "grabbing" },
            })}
            {...attributes}
            {...listeners}
          >
            <div>
              <MoreMenuIcon fill="currentcolor" />
            </div>
          </IconButton>
        )}
        <IconButton variant="ghost" size="xs" onClick={onRequestRemove}>
          <CloseIcon fill="currentcolor" />
        </IconButton>
      </div>
    </div>
  );
}
