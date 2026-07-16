"use client";

import { Loader2 } from "lucide-react";
import { useCompleteShoppingList } from "@/lib/hooks/useShopping";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { formatPrice } from "./helpers";

interface CompleteDialogProps {
  open: boolean;
  listId: string;
  listName: string;
  totalActual: number;
  onOpenChange: (v: boolean) => void;
  onClose: () => void;
}

export function CompleteDialog({
  open, listId, listName, totalActual, onOpenChange, onClose,
}: CompleteDialogProps) {
  const complete = useCompleteShoppingList();

  const handleComplete = () => {
    complete.mutate(
      { id: listId },
      { onSuccess: () => { onOpenChange(false); onClose(); } }
    );
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Завершить поход?</AlertDialogTitle>
          <AlertDialogDescription>
            Будет создана транзакция в финансах на сумму{" "}
            <span className="text-text font-medium">{formatPrice(totalActual)}</span>.
            Список «{listName}» будет помечен как завершённый.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction onClick={handleComplete} disabled={complete.isPending}>
            {complete.isPending && <Loader2 size={13} className="animate-spin mr-1.5" />}
            Завершить
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
