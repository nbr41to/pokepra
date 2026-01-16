"use client";

import { type ComponentProps, useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
} from "@/components/ui/select";
import { type BoardCondition, generateBoardByConditions } from "@/utils/board";
import { toHandString } from "@/utils/card";
import { InputCards } from "./input-cards";

export const InputBoard = (props: ComponentProps<typeof InputCards>) => {
  const [opened, setOpened] = useState(false);
  const [value, setValue] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  const handleOpenChange = (texture: string) => {
    try {
      const board = generateBoardByConditions({
        conditions: texture as BoardCondition,
        excludes: props.banCards,
      });
      props.onChange?.(toHandString(board));
      setOpened(false);
      setValue("");
      setError(null);
    } catch {
      setError("他のカードの入力を削除してください");
      setOpened(false);
    }
  };

  return (
    <div className="relative">
      <InputCards {...props} />
      {error && (
        <div className="mt-2 w-[calc(100%-3.3rem)] rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-destructive text-xs">
          {error}
        </div>
      )}
      <Select
        open={opened}
        onOpenChange={setOpened}
        value={value}
        onValueChange={handleOpenChange}
      >
        <SelectTrigger className="absolute top-2 right-15 size-12! bg-background [&_svg]:size-6! [&_svg]:text-foreground!" />

        <SelectContent side="bottom" align="end" position="popper">
          <SelectGroup>
            <SelectLabel>ボードを自動生成</SelectLabel>
            <SelectItem value="none" className="bg-background! [&_svg]:hidden">
              ランダムに生成
            </SelectItem>
          </SelectGroup>
          <SelectSeparator />
          <SelectGroup>
            <SelectLabel>ボードテクスチャ</SelectLabel>
            <SelectItem value="pair" className="bg-background! [&_svg]:hidden">
              <div className="flex h-12 flex-col justify-center">
                <div className="text-left">ペアボード</div>
                <div className="text-muted-foreground text-sm/[1]!">
                  ペアができているボード
                </div>
              </div>
            </SelectItem>
            <SelectItem
              value="monotone"
              className="bg-background! [&_svg]:hidden"
            >
              <div className="flex h-12 flex-col justify-center">
                <div className="text-left">モノトーン</div>
                <div className="text-muted-foreground text-sm/[1]!">
                  すべて同じスート
                </div>
              </div>
            </SelectItem>
            <SelectItem
              value="two-tone"
              className="bg-background! [&_svg]:hidden"
            >
              <div className="flex h-12 flex-col justify-center">
                <div className="text-left">ツートーン</div>
                <div className="text-muted-foreground text-sm/[1]!">
                  2つのスートが混在
                </div>
              </div>
            </SelectItem>
            <SelectItem
              value="rainbow"
              className="bg-background! [&_svg]:hidden"
            >
              <div className="flex h-12 flex-col justify-center">
                <div className="text-left">レインボー</div>
                <div className="text-muted-foreground text-sm/[1]!">
                  すべて異なるスート
                </div>
              </div>
            </SelectItem>
            <SelectItem
              value="connected"
              className="bg-background! [&_svg]:hidden"
            >
              <div className="flex h-12 flex-col justify-center">
                <div className="text-left">コネクト</div>
                <div className="text-muted-foreground text-sm/[1]!">
                  ストレートができやすいボード
                </div>
              </div>
            </SelectItem>
            <SelectItem value="high" className="bg-background! [&_svg]:hidden">
              <div className="flex h-12 flex-col justify-center">
                <div className="text-left">ハイボード</div>
                <div className="text-muted-foreground text-sm/[1]!">
                  高いランクのカードが多いボード
                </div>
              </div>
            </SelectItem>
            <SelectItem value="low" className="bg-background! [&_svg]:hidden">
              <div className="flex h-12 flex-col justify-center">
                <div className="text-left">ローボード</div>
                <div className="text-muted-foreground text-sm/[1]!">
                  低いランクのカードが多いボード
                </div>
              </div>
            </SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};
