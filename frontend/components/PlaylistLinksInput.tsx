"use client";

import {
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Textarea,
  useDisclosure,
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
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
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
    onOpenChange();
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Button color="primary" onPress={handleAdd}>
          Добавить
        </Button>
        <Button variant="flat" onPress={() => onOpen()}>
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
            <Input
              key={`${index}-${value}`}
              label={`Ссылка ${index + 1}`}
              value={value}
              onValueChange={(nextValue) => handleValueChange(index, nextValue)}
              isInvalid={Boolean(errors[index])}
              errorMessage={errors[index]}
              description={hint}
              endContent={
                values.length > 1 ? (
                  <Button
                    size="sm"
                    variant="light"
                    color="danger"
                    onPress={() => handleRemove(index)}
                  >
                    Удалить
                  </Button>
                ) : null
              }
            />
          );
        })}
      </div>

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="2xl">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader>Вставить список ссылок</ModalHeader>
              <ModalBody>
                <Textarea
                  minRows={6}
                  placeholder="Каждая ссылка с новой строки"
                  value={bulkText}
                  onValueChange={setBulkText}
                />
              </ModalBody>
              <ModalFooter>
                <Button variant="light" onPress={onClose}>
                  Отмена
                </Button>
                <Button color="primary" onPress={handleBulkApply}>
                  Применить
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </section>
  );
}
