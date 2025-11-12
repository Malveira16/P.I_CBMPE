import { Button } from "../../../components/Button";

type Props = {
  onClearStorage: () => void;
  onSave: () => Promise<void> | void;
};

export default function FooterActions({ onClearStorage, onSave }: Props) {
  return (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
      <Button
        text="Limpar"
        type="button"
        variant="secondary"
        onClick={onClearStorage}
        style={{ padding: "8px 14px", borderRadius: 6 }}
      />
      <Button
        text="Salvar Ocorrência"
        type="button"
        variant="danger"
        onClick={onSave}
      />
    </div>
  );
}