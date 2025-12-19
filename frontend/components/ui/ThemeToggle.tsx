"use client";

import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger } from "@heroui/react";
import { useThemeMode } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useThemeMode();

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button variant="ghost" size="sm">
          Тема: {theme}
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="theme switch">
        <DropdownItem key="light" onPress={() => setTheme("light")}>
          Светлая
        </DropdownItem>
        <DropdownItem key="dark" onPress={() => setTheme("dark")}>
          Тёмная
        </DropdownItem>
        <DropdownItem key="system" onPress={() => setTheme("system")}>
          Системная
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
