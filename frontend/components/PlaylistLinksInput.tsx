"use client";

import {
  Button,
  Description,
  FieldError,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalHeading,
  ModalContainer,
  ModalDialog,
  TextField,
  TextArea,
  useOverlayState,
} from "@heroui/react";
import { useMemo, useState } from "react";
import { likelyYandexPlaylist, validatePlaylistUrl } from "../lib/validate";

type PlaylistLinksInputProps = {
  values: string[];
  onChange: (values: string[]) => void;
};

const normalizeList = (text: string) => {
  const lines = text
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
  return Array.from(new Set(lines));
};

export function PlaylistLinksInput({ values, onChange }: PlaylistLinksInputProps) {
  const modalState = useOverlayState();
  const [bulkText, setBulkText] = useState("");

  const errors = useMemo(
    () =>
      values.map((value) => {
        if (!value.trim()) {
          return "Введите ссылку";
        }
        const validation = validatePlaylistUrl(value);
        if (!validation.isValid) {
          return validation.errors[0];
        }
        return "";
      }),
    [values],
  );

  const hasErrors = errors.some(Boolean);

  const handleValueChange = (index: number, value: string) => {
    const next = [...values];
    next[index] = value;
    onChange(next);
  };

  const handleAdd = () => {
    onChange([...values, ""]);
  };

  const handleRemove = (index: number) => {
    if (values.length <= 1) return;
    onChange(values.filter((_, i) => i !== index));
  };

  const handleClear = () => {
    onChange([""]);
  };

  const handleBulkApply = () => {
    const next = normalizeList(bulkText);
    onChange(next.length ? next : [""]);
    setBulkText("");
    modalState.close();
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="primary" onPress={handleAdd}>
          Добавить
        </Button>
        <Button variant="flat" onPress={modalState.open}>
          Вставить списком
        </Button>
        <Button variant="light" onPress={handleClear}>
          Очистить всё
        </Button>
        {hasErrors && (
          <span className="text-sm text-danger">
            Исправьте ошибки в ссылках
          </span>
        )}
      </div>

      <div className="space-y-3">
        {values.map((value, index) => {
          const hint = value && likelyYandexPlaylist(value) ? "Похоже на плейлист Яндекс.Музыки" : "";
          return (
            <TextField
              key={`${index}-${value}`}
              isInvalid={Boolean(errors[index])}
              value={value}
              onChange={(nextValue) => handleValueChange(index, nextValue)}
            >
              <Label>Ссылка {index + 1}</Label>
              <div className="flex flex-wrap items-center gap-2">
                <Input className="min-w-[220px] flex-1" />
                {values.length > 1 ? (
                  <Button
                    size="sm"
                    variant="light"
                    color="danger"
                    onPress={() => handleRemove(index)}
                  >
                    Удалить
                  </Button>
                ) : null}
              </div>
              {hint ? <Description>{hint}</Description> : null}
              {errors[index] ? <FieldError>{errors[index]}</FieldError> : null}
            </TextField>
          );
        })}
      </div>

      <Modal state={modalState}>
        <ModalContainer>
          <ModalDialog>
            <ModalHeader>
              <ModalHeading>Вставить список ссылок</ModalHeading>
            </ModalHeader>
            <ModalBody>
              <TextArea
                minRows={6}
                placeholder="Каждая ссылка с новой строки"
                value={bulkText}
                onChange={setBulkText}
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={modalState.close}>
                Отмена
              </Button>
              <Button variant="primary" onPress={handleBulkApply}>
                Применить
              </Button>
            </ModalFooter>
          </ModalDialog>
        </ModalContainer>
      </Modal>
    </section>
  );
}
