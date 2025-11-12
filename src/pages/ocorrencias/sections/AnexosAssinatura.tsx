/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { UploadArea, PreviewList, SignatureBox, SignatureActions, ModalOverlay, ModalContent } from "../../../components/EstilosPainel.styles";
import { PaperclipIcon } from "@phosphor-icons/react";
import { Button } from "../../../components/Button";

type UploadedFile = {
  file?: File;
  url?: string;
  name: string;
  preview?: string;
};

type Props = {
  uploadedFiles: UploadedFile[];
  handleFileUpload: (files: FileList | null) => Promise<void>;
  signatureCanvasRef: React.RefObject<HTMLCanvasElement>;
  modalCanvasRef: React.RefObject<HTMLCanvasElement>;
  signatureModalOpen: boolean;
  setSignatureModalOpen: (v: boolean) => void;
  modalCanvasWidth: number;
  startModalDrawing: (e: any) => void;
  drawModal: (e: any) => void;
  endModalDrawing: (e?: any) => void;
  clearModalSignature: () => void;
  saveModalSignature: () => Promise<void>;
  clearSignature: () => void;
};

export default function AnexosAssinatura({
  uploadedFiles,
  handleFileUpload,
  signatureCanvasRef,
  modalCanvasRef,
  signatureModalOpen,
  setSignatureModalOpen,
  modalCanvasWidth,
  startModalDrawing,
  drawModal,
  endModalDrawing,
  clearModalSignature,
  saveModalSignature,
  clearSignature,
}: Props) {
  return (
    <div>
      <section>
        <h3 style={{ display: "flex", alignItems: "center", gap: 8 }}><PaperclipIcon size={20} /> Anexos e Evidências</h3>
        <UploadArea
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFileUpload(e.dataTransfer.files);
          }}
        >
          <p>Arraste arquivos aqui ou clique para selecionar</p>
          <input type="file" accept="image/*,application/pdf" multiple capture="environment" onChange={(e) => handleFileUpload(e.target.files)} />
        </UploadArea>

        {uploadedFiles.length > 0 && (
          <PreviewList>
            {uploadedFiles.map((f, idx) => (
              <div key={idx} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span>{f.name}</span>
                {f.url ? (
                  <a href={f.url} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8 }}>
                    Visualizar
                  </a>
                ) : f.preview ? (
                  <a href={f.preview} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 8 }}>
                    Visualizar (local)
                  </a>
                ) : (
                  <span style={{ marginLeft: 8, color: "#64748b" }}>Local — será enviado ao salvar</span>
                )}
              </div>
            ))}
          </PreviewList>
        )}
      </section>

      <section style={{ marginTop: 12 }}>
        <h4>Assinatura do Responsável</h4>
        <SignatureBox>
          <canvas ref={signatureCanvasRef} width={window.innerWidth < 480 ? 300 : 500} height={200} />
          <SignatureActions>
            <Button variant="secondary" text="Limpar" onClick={clearSignature} />
            <Button text="Abrir tela maior" onClick={() => setSignatureModalOpen(true)} />
          </SignatureActions>
        </SignatureBox>

        {signatureModalOpen && (
          <ModalOverlay>
            <ModalContent>
              <div className="modal-content-canvas-block" style={{ width: "100%" }}>
                <canvas
                  ref={modalCanvasRef}
                  width={modalCanvasWidth}
                  height={300}
                  onPointerDown={startModalDrawing}
                  onPointerMove={drawModal}
                  onPointerUp={endModalDrawing}
                  onPointerCancel={endModalDrawing}
                  style={{ width: "100%", height: 300, display: "block" }}
                />
              </div>
              <div style={{ display: "flex", gap: "0.5rem", marginTop: 12 }}>
                <Button variant="secondary" text="Limpar" onClick={clearModalSignature} />
                <Button text="Salvar" onClick={saveModalSignature} />
                <Button variant="secondary" text="Fechar" onClick={() => setSignatureModalOpen(false)} />
              </div>
            </ModalContent>
          </ModalOverlay>
        )}
      </section>
    </div>
  );
}