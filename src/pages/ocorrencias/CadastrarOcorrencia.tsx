/* eslint-disable @typescript-eslint/no-explicit-any */
import { FileTextIcon, FireTruckIcon, /* GearIcon,*/ MapPinIcon, PaperclipIcon, UserIcon, WarningCircleIcon } from "@phosphor-icons/react";
import { BoxInfo, SectionTitle, Grid, Field, FullField, ContainerPainel, GridColumn, ResponsiveRow, PageSubtitle, PageTitle, PageTopHeader, RequiredNotice, /* TeamSearchWrapper, TeamSearchInput, TeamResults, TeamBox, TeamChip, */ MapFullBox, MapPlaceholder, PersonCard, PersonCardHeader, PersonRemoveButton, UploadArea, Divider, PreviewList, SectionSubtitle, SignatureActions, SignatureBox, ModalContent, ModalOverlay, StatusAlert } from "../../components/EstilosPainel.styles";
import { Breadcrumb } from "../../components/Breadcrumb";
import { useEffect, useRef, useState } from "react";
import { fetchBairrosFromOSM, fetchMunicipiosPE, type Municipio } from "../../services/municipio_bairro";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Button } from "../../components/Button";
import { useOnlineStatus } from "../../utils/useOnlineStatus";
import { uploadToCloudinary } from "../../utils/uploadToCloudinary";
import axios from "axios";
import { formatCPF } from "../../utils/formatCPF";

export function NovaOcorrencia() {
  const isOnline = useOnlineStatus();
  const CACHE_KEY = "ocorrencias_offline";

  // Função para formatar a data atual no formato datetime-local
  const getCurrentDateTime = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const adjusted = new Date(now.getTime() - offset * 60 * 1000);
    return adjusted.toISOString().slice(0, 16); // Formato YYYY-MM-DDThh:mm
  };

  function saveOffline(ocorrencia: any) {
    // gerar um id único para poder identificar/remover depois
    const id = Date.now() + Math.floor(Math.random() * 1000);
    const timestamped = {
      id,
      ...ocorrencia,
      savedAt: new Date().toISOString(),
    };

    try {
      const existing = localStorage.getItem(CACHE_KEY);
      const list = existing ? JSON.parse(existing) : [];
      list.push(timestamped);
      localStorage.setItem(CACHE_KEY, JSON.stringify(list));
      console.debug("Ocorrência salva no localStorage:", timestamped);
      return timestamped;
    } catch (err) {
      console.error("Erro ao salvar no localStorage:", err);
      try {
        const existing = sessionStorage.getItem(CACHE_KEY);
        const list = existing ? JSON.parse(existing) : [];
        list.push(timestamped);
        sessionStorage.setItem(CACHE_KEY, JSON.stringify(list));
        console.debug("Ocorrência salva no sessionStorage (fallback):", timestamped);
        return timestamped;
      } catch (err2) {
        console.error("Falha também no sessionStorage:", err2);
        alert("Não foi possível salvar localmente. Verifique as permissões do navegador.");
        return null;
      }
    }
  }

  function getOfflineOccurrences() {
    try {
      const existing = localStorage.getItem(CACHE_KEY);
      return existing ? JSON.parse(existing) : [];
    } catch (err) {
      console.error("Erro ao ler localStorage, tentando sessionStorage:", err);
      try {
        const existing = sessionStorage.getItem(CACHE_KEY);
        return existing ? JSON.parse(existing) : [];
      } catch (err2) {
        console.error("Falha ao ler sessionStorage:", err2);
        return [];
      }
    }
  }

  type UploadedFile = {
    file?: File;    // só existe se for arquivo local
    url?: string;   // só existe se já foi enviado
    name: string;   // nome do arquivo
    preview?: string; // preview local (object URL) para imagens
  };


  const [offlineOccurrences, setOfflineOccurrences] = useState<any[]>([]);

  const [naturezasOcorrencias, setNaturezasOcorrencias] = useState<
    { id: number; nome: string; sigla: string; pontoBase: string }[]
  >([]);
  const [natureza, setNatureza] = useState("");
  const [loadingNaturezas, setLoadingNaturezas] = useState<boolean>(true);

  const [condicoesVitima, setCondicoesVitima] = useState<
    { id: number; tipoLesao: string }[]
  >([]);
  
  const [loadingCondicaoVitima, setLoadingCondicaoVitima] = useState<boolean>(true);
  const [dataChamado, setDataChamado] = useState(getCurrentDateTime());

  const [statusAtendimento, setStatusAtendimento] = useState("Pendente");
  const [motivoNaoAtendimento, setMotivoNaoAtendimento] = useState("");

  const [descricao, setDescricao] = useState("");

  const [unidadesOperacionais, setUnidadesOperacionais] = useState<
    { id: number; nome: string; sigla: string; pontoBase: string }[]
  >([]);
  const [unidade, setUnidade] = useState("");
  const [loadingUnidades, setLoadingUnidades] = useState<boolean>(true);

  const [gruposOcorrencias, setGruposOcorrencias] = useState<
    {
      naturezaOcorrencia: any; id: number; nome: string;
    }[]
  >([]);

  const [loadingGrupos, setLoadingGrupos] = useState<boolean>(true);
  const [grupo, setGrupo] = useState("");


  const [subgruposOcorrencias, setSubgruposOcorrencias] = useState<
    {
      grupoOcorrencia: any; id: number; nome: string;
    }[]
  >([]);
  const [loadingSubgrupos, setLoadingSubgrupos] = useState<boolean>(true);
  const [subgrupo, setSubgrupo] = useState("");

  const [numeroOcorrencia, setNumeroOcorrencia] = useState("");

  const [numeracaoViatura, setNumeracaoViatura] = useState("");
  const [loadingNumeracaoViatura, setLoadingNumeracaoViatura] = useState(false);
  const [viaturas, setViaturas] = useState<any[]>([]);

  const [tempoResposta, setTempoResposta] = useState("");
  const [observacoesAdicionais, setObservacoesAdicionais] = useState("");
  const [complemento, setComplemento] = useState("");
  const [referencia, setReferencia] = useState("");
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  const [selectedMunicipioId, setSelectedMunicipioId] = useState<number | "">("");
  const [selectedMunicipioNome, setSelectedMunicipioNome] = useState("");
  const [forceManualLocationInput, setForceManualLocationInput] = useState(false);
  const [bairros, setBairros] = useState<string[]>([]);
  const [bairro, setBairro] = useState("");
  const [isGeocoding, setIsGeocoding] = useState<boolean>(false);
  const [logradouro, setLogradouro] = useState("");
  const [numero, setNumero] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [formaAcionamento, setFormaAcionamento] = useState("Telefone");
  const [isLoadingOffline, setIsLoadingOffline] = useState(false);
  /* const [users] = useState<string[]>([
    "Cabo Silva",
    "Sargento Souza",
    "Tenente Costa",
    "Capitão Lima",
    "Soldado Araújo",
    "Soldada Araújo",
    "Major Fernandes",
  ]); */
  // const [chefe, setChefe] = useState("");
  // const [lider, setLider] = useState("");
  // const [team, setTeam] = useState<string[]>([]);
  // const [teamQuery, setTeamQuery] = useState("");
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const signatureCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const modalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isModalDrawing, setIsModalDrawing] = useState(false);
  const [assinaturaUrl, setAssinaturaUrl] = useState<string | undefined>(undefined);
  // armazena a assinatura localmente (dataURL) até o envio final ao salvar a ocorrência
  const [assinaturaDataUrl, setAssinaturaDataUrl] = useState<string | undefined>(undefined);

  // novo: largura controlada do canvas do modal para não exceder a viewport
  const [modalCanvasWidth, setModalCanvasWidth] = useState<number>(() =>
    typeof window !== "undefined" ? Math.min(Math.max(280, window.innerWidth - 40), 900) : 800
  );

  // novo: bloquear o scroll do body e impedir touchmove enquanto o modal estiver aberto;
  // também atualiza o tamanho do canvas quando a janela é redimensionada.
  useEffect(() => {
    if (!signatureModalOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const preventTouch = (e: TouchEvent) => {
      // somente previne quando o alvo for o canvas ou estiver dentro do modal
      const target = e.target as HTMLElement | null;
      if (!target) return;
      if (target.closest && target.closest(".modal-content-canvas-block")) {
        if (e.cancelable) e.preventDefault();
      }
    };
    // listeners com passive:false para permitir preventDefault em touchmove
    document.addEventListener("touchmove", preventTouch, { passive: false });

    const updateSize = () => {
      const w = typeof window !== "undefined" ? Math.min(Math.max(280, window.innerWidth - 40), 900) : modalCanvasWidth;
      setModalCanvasWidth(w);
    };
    updateSize();
    window.addEventListener("resize", updateSize);

    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("touchmove", preventTouch);
      window.removeEventListener("resize", updateSize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [signatureModalOpen]);

  console.log(assinaturaUrl, assinaturaDataUrl);

  const [eventoEspecial, setEventoEspecial] = useState(false);

  const [usuarioLogado] = useState({
    id: 64
  });


  type Pessoa = {
    id: number;
    nome: string;
    sexo?: string;
    etnia?: string;
    idade?: number;
    cpf: string;
    tipoAtendimento: string;
    observacoes: string;
    condicao: string;
    destinoVitima?: string;
    condicaoVitima?: number;
  };

  useEffect(() => {
    if (isOnline) {
      const offlineData = getOfflineOccurrences();
      if (offlineData.length > 0) {
        offlineData.forEach(async (ocorrencia: any) => {
          try {
            await fakeSendToServer(ocorrencia);
          } catch (err) {
            console.error("Erro ao enviar ocorrência offline:", err);
          }
        });
      }
    }
  }, [isOnline]);

  useEffect(() => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const adjusted = new Date(now.getTime() - offset * 60 * 1000);
    const formattedDate = adjusted.toISOString().replace(/[-:.TZ]/g, ""); // YYYYMMDDHHMMSS
    setNumeroOcorrencia(`OCR${formattedDate}`);
  }, []);


  async function fakeSendToServer(data: any) {
    console.log("Enviando para o servidor:", data);
    return new Promise((resolve) => setTimeout(resolve, 1000));
  }

  /* const handleAddToTeam = (name: string) => {
    if (!name) return;
    setTeam((t) => (t.includes(name) ? t : [...t, name]));
    setTeamQuery("");
  };

  const handleRemoveFromTeam = (name: string) => {
    setTeam((t) => t.filter((x) => x !== name));
  };

  const filteredUsers = users.filter(
    (u) => u.toLowerCase().includes(teamQuery.toLowerCase()) && !team.includes(u)
  );
*/
  if ("Marker" in L && !(L as any)._copilot_icon_set) {
    const DefaultIcon = L.icon({
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });
    (L as any).Marker.prototype.options.icon = DefaultIcon;
    (L as any)._copilot_icon_set = true;
  }

  useEffect(() => {
    fetchMunicipiosPE()
      .then(setMunicipios)
      .catch((err) => console.error("Erro ao buscar municípios IBGE:", err));
  }, []);

  useEffect(() => {
    if (!selectedMunicipioId) {
      setBairros([]);
      return;
    }
    fetchBairrosFromOSM(String(municipios.find((m) => m.id === selectedMunicipioId)?.nome))
      .then(setBairros)
      .catch((err) => {
        console.error("Erro ao buscar distritos IBGE:", err);
        setBairros([]);
      });
  }, [municipios, selectedMunicipioId]);

  const requiredLocationFilled =
    Boolean(selectedMunicipioId) &&
    bairro.trim() !== "" &&
    logradouro.trim() !== "" &&
    numero.trim() !== "";

  useEffect(() => {
    async function geocodeAddress() {
      if (!requiredLocationFilled || isLoadingOffline) return;
      const municipioNome = municipios.find((m) => m.id === selectedMunicipioId)?.nome || "";
      const q = `${logradouro}, ${numero}, ${bairro}, ${municipioNome}, Pernambuco, Brazil`;
      setIsGeocoding(true);
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=1`
        );
        if (!res.ok) throw new Error(`Nominatim error: ${res.status}`);
        const json = (await res.json()) as Array<{ lat: string; lon: string }>;
        if (Array.isArray(json) && json.length > 0) {
          setLatitude(json[0].lat);
          setLongitude(json[0].lon);
        } else {
          console.warn("Geocoding sem resultado para:", q);
        }
      } catch (err) {
        console.error("Erro no geocoding:", err);
      } finally {
        setIsGeocoding(false);
      }
    }
    geocodeAddress();
  }, [requiredLocationFilled, selectedMunicipioId, bairro, logradouro, numero, municipios, isLoadingOffline]);

  const addPessoa = () => {
    setPessoas((prev) => [
      ...prev,
      { id: Date.now() + Math.floor(Math.random() * 1000), nome: "", idade: undefined, cpf: "", tipoAtendimento: "", condicao: "", sexo: "", etnia: "", observacoes: "" },
    ]);
  };


  const updatePessoa = (id: number, patch: Partial<Pessoa>) => {
    setPessoas((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const removePessoa = (id: number) => {
    setPessoas((prev) => (prev.length > 0 ? prev.filter((p) => p.id !== id) : prev));
  };

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return;

    // Apenas adiciona os arquivos localmente (não faz upload aqui).
    const newFiles: UploadedFile[] = Array.from(files).map((file) => ({
      file,
      name: file.name,
      url: undefined,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);

    // OBS: o upload só ocorrerá no fluxo de "Salvar Ocorrência" (já implementado).
  };

  useEffect(() => {
    const fetchViaturas = async () => {
      try {
        const response = await axios.get("https://backend-chama.up.railway.app/viaturas");
        setViaturas(response.data);
      } catch (error) {
        console.error("Erro ao carregar viaturas:", error);
        alert("Erro ao carregar viaturas");
      } finally {
        setLoadingNumeracaoViatura(false);
      }
    };

    fetchViaturas();
  }, []);


  useEffect(() => {
    const fetchUnidades = async () => {
      try {
        const response = await axios.get("https://backend-chama.up.railway.app/unidadesoperacionais");
        setUnidadesOperacionais(response.data);
      } catch (error) {
        console.error("Erro ao carregar unidades:", error);
        alert("Erro ao carregar unidades operacionais");
      } finally {
        setLoadingUnidades(false);
      }
    };

    fetchUnidades();
  }, []);

  useEffect(() => {
    const fetchNaturezas = async () => {
      try {
        const response = await axios.get("https://backend-chama.up.railway.app/naturezasocorrencias");
        setNaturezasOcorrencias(response.data);
      } catch (error) {
        console.error("Erro ao carregar naturezas:", error);
        alert("Erro ao carregar naturezas de ocorrências");
      } finally {
        setLoadingNaturezas(false); // <--- importante!
      }
    };

    fetchNaturezas();
  }, []);

  useEffect(() => {
    const fetchGrupos = async () => {
      try {
        const response = await axios.get("https://backend-chama.up.railway.app/gruposocorrencias");
        setGruposOcorrencias(response.data);
      } catch (error) {
        console.error("Erro ao carregar grupos de ocorrências:", error);
        alert("Erro ao carregar grupos de ocorrências");
      } finally {
        setLoadingGrupos(false);
      }
    };

    fetchGrupos();
  }, []);

  useEffect(() => {
    const fetchSubgrupos = async () => {
      try {
        const response = await axios.get("https://backend-chama.up.railway.app/subgruposocorrencias");
        setSubgruposOcorrencias(response.data);
      } catch (error) {
        console.error("Erro ao carregar subgrupos de ocorrências:", error);
        alert("Erro ao carregar subgrupos de ocorrências");
      } finally {
        setLoadingSubgrupos(false);
      }
    };

    fetchSubgrupos();
  }, []);

  useEffect(() => {
    const fetchCondicaoVitima = async () => {
      try {
        const response = await axios.get("https://backend-chama.up.railway.app/lesoes");
        setCondicoesVitima(response.data);
      } catch (error) {
        console.error("Erro ao carregar condições da vítima:", error);
        alert("Erro ao carregar condições da vítima");
      } finally {
        setLoadingCondicaoVitima(false); // <--- importante!
      }
    };

    fetchCondicaoVitima();
  }, []);


  // ======= NOVOS HANDLERS (Pointer Events) =======
  const startDrawing = (e: any) => {
    // React's pointer event / native pointer available — previne scroll e captura o ponteiro
    try {
      e.preventDefault();
    } catch { /* noop */ }

    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // garantir captura do pointer (mantém os eventos mesmo se o dedo mover para fora)
    try {
      if (typeof e.pointerId === "number" && canvas.setPointerCapture) {
        canvas.setPointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }

    setIsDrawing(true);
    const { x, y } = getCoordinates(e, canvas);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: any) => {
    try {
      e.preventDefault();
    } catch {
      // noop
    }

    if (!isDrawing) return;
    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCoordinates(e, canvas);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const endDrawing = (e?: any) => {
    // tenta liberar a captura do pointer se disponível
    try {
      if (e && typeof e.pointerId === "number" && signatureCanvasRef.current?.releasePointerCapture) {
        signatureCanvasRef.current.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }
    setIsDrawing(false);
  };

  const getCoordinates = (e: any, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();

    // PointerEvent / MouseEvent com clientX/clientY
    if (typeof e.clientX === "number" && typeof e.clientY === "number") {
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }

    // TouchEvent (fallback)
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top,
      };
    }

    // changedTouches fallback (ex: touchend)
    if (e.changedTouches && e.changedTouches.length > 0) {
      return {
        x: e.changedTouches[0].clientX - rect.left,
        y: e.changedTouches[0].clientY - rect.top,
      };
    }

    // último recurso
    return { x: 0, y: 0 };
  };

  // Modal canvas: mesmos princípios
  const startModalDrawing = (e: any) => {
    try {
      e.preventDefault();
    } catch { 
      /* noop */ 
    }

    const modal = modalCanvasRef.current;
    if (!modal) return;
    const ctx = modal.getContext("2d");
    if (!ctx) return;

    try {
      if (typeof e.pointerId === "number" && modal.setPointerCapture) {
        modal.setPointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }

    setIsModalDrawing(true);
    const { x, y } = getCoordinates(e, modal);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const drawModal = (e: any) => {
    try {
      e.preventDefault();
    } catch {
      /* noop */ 
    }

    if (!isModalDrawing || !modalCanvasRef.current) return;
    const modal = modalCanvasRef.current;
    const ctx = modal.getContext("2d");
    if (!ctx) return;
    const { x, y } = getCoordinates(e, modal);
    ctx.lineTo(x, y);
    ctx.strokeStyle = "#000";
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.stroke();
  };

  const endModalDrawing = (e?: any) => {
    try {
      const modal = modalCanvasRef.current;
      if (e && typeof e.pointerId === "number" && modal?.releasePointerCapture) {
        modal.releasePointerCapture(e.pointerId);
      }
    } catch {
      // ignore
    }
    setIsModalDrawing(false);
  };
  
  const clearModalSignature = () => {
    const modal = modalCanvasRef.current;
    if (!modal) return;
    const ctx = modal.getContext("2d");
    ctx?.clearRect(0, 0, modal.width, modal.height);
  };

  const saveModalSignature = async () => {
    const modal = modalCanvasRef.current;
    if (!modal) return;
    try {
      const dataURL = modal.toDataURL("image/png");
 
       // Copia a imagem do canvas modal para o canvas principal (tela menor)
       if (signatureCanvasRef.current) {
         const mainCanvas = signatureCanvasRef.current;
         const mainCtx = mainCanvas.getContext("2d");
         if (mainCtx) {
           mainCtx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);
           const img = new Image();
           img.onload = () => {
             mainCtx.drawImage(img, 0, 0, mainCanvas.width, mainCanvas.height);
             // guarda localmente o dataURL da assinatura (upload só ao salvar a ocorrência)
             setAssinaturaDataUrl(dataURL);
             setAssinaturaUrl(undefined);
           };
           img.src = dataURL;
         } else {
           setAssinaturaDataUrl(dataURL);
         }
       } else {
         setAssinaturaDataUrl(dataURL);
       }
 
       alert("Assinatura aplicada ao formulário (salva localmente). Será enviada ao salvar a ocorrência.");
     } catch (err) {
       console.error("Erro ao salvar assinatura do modal:", err);
       alert("Falha ao salvar assinatura do modal.");
     } finally {
       setSignatureModalOpen(false);
     }
   };
  
  function loadOfflineOccurrences() {
    const cached = getOfflineOccurrences();
    setOfflineOccurrences(cached);

    if (cached.length > 0) {
      const last = cached[cached.length - 1];
      console.debug("Recuperando ocorrência offline:", last);

      setIsLoadingOffline(true);

      setDataChamado(last.dataChamado || getCurrentDateTime());
      // setNaturezaOcorrencia(last.naturezaOcorrencia || "Incêndio");
      setStatusAtendimento(last.statusAtendimento || "Pendente");
      setDescricao(last.descricao || "");
      setUnidadesOperacionais(last.unidadeOperacional || "");
      // setChefe(last.chefe || "");
      // setLider(last.lider || "");
      // setPontoBase(last.pontoBase || "");
      // setViaturaUtilizada(last.viaturaUtilizada || "");
      setNumeracaoViatura(last.numeracaoViatura || "");
      setTempoResposta(last.tempoResposta || "");
      setObservacoesAdicionais(last.observacoesAdicionais || "");
      setComplemento(last.complemento || "");
      setReferencia(last.referencia || "");

      const muniId = last.municipioId !== undefined && last.municipioId !== null && last.municipioId !== "" ? Number(last.municipioId) : "";
      setSelectedMunicipioId(Number.isNaN(muniId) ? "" : muniId);
      setSelectedMunicipioNome(last.municipioNome || "");
      setBairro(last.bairro || "");
      setLogradouro(last.logradouro || "");
      setNumero(last.numero || "");
      setLatitude(last.latitude || "");
      setLongitude(last.longitude || "");

      // const equipe = Array.isArray(last.equipe) ? last.equipe : (last.equipe ? [String(last.equipe)] : []);
      // setTeam(equipe);

      const rawPessoas = Array.isArray(last.pessoas) ? last.pessoas : [];
      const normalizedPessoas = rawPessoas.map((p: any, idx: number) => ({
        id: p?.id ?? Date.now() + idx,
        nome: p?.nome ?? "",
        idade: p?.idade ?? "",
        cpf: p?.cpf ?? "",
        tipoAtendimento: p?.tipoAtendimento ?? "",
        condicao: p?.condicao ?? "Ileso",
        sexo: p?.sexo ?? "",
        etnia: p?.etnia ?? "",
        observacoes: p?.observacoes ?? "",
      }));
      setPessoas(normalizedPessoas);

      const arquivoNomes = Array.isArray(last.arquivos) ? last.arquivos : [];
      const files = arquivoNomes.map((name: string) => ({ name, url: undefined }));
      setUploadedFiles(files);


      setTimeout(() => setIsLoadingOffline(false), 0);
    }
  }

  useEffect(() => {
    loadOfflineOccurrences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  const handleUseLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocalização não suportada pelo navegador.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        // Atualiza latitude e longitude
        setLatitude(String(latitude));
        setLongitude(String(longitude));

        try {
          const res = await fetch(
            `https://backend-chama.up.railway.app/api/reverse-geocode?lat=${latitude}&lon=${longitude}`
          );

          if (!res.ok) throw new Error("Erro ao buscar endereço");

          const data = await res.json();

          // Preencher campos de endereço automaticamente
          if (data.address) {
            setLogradouro(data.address.road || "");
            setNumero(data.address.house_number || "");
            setBairro(data.address.suburb || "");
            setComplemento(""); // pode usar referência se quiser
            setReferencia(""); // opcional, você pode extrair de data.display_name se desejar
            setSelectedMunicipioNome(data.address.city || "");
            // se você tiver ID do município no frontend, pode mapear pelo nome
            const municipio = municipios.find((m) => m.nome === data.address.city);
            setSelectedMunicipioId(municipio ? municipio.id : "");
          }

          setForceManualLocationInput(false);
        } catch (err) {
          console.error("Erro no reverse geocoding:", err);
          setForceManualLocationInput(true);
          alert("Erro ao obter endereço. Preencha manualmente.");
        }
      },
      (err) => {
        console.error("Erro ao obter localização:", err);
        setForceManualLocationInput(true);
      }
    );
  };



  function clearSignature() {    const canvas = signatureCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    setAssinaturaDataUrl(undefined);
    setAssinaturaUrl(undefined);
  }

  return (
    <ContainerPainel>
      <PageTopHeader>
        <Breadcrumb
          items={[
            { label: "Ocorrências", onClick: () => console.log("Voltar às ocorrências") },
            { label: "Cadastrar Ocorrência" },
          ]}
        />

        {offlineOccurrences.length > 0 && (
          <ResponsiveRow>
            <GridColumn weight={1}>
              <StatusAlert isOnline={isOnline}>
                <div className="status-row">
                  <span className="dot" />
                  <strong>{isOnline ? "Conectado" : "Offline"}</strong>
                </div>

                {isOnline ? (
                  <div className="message">
                    <WarningCircleIcon size={22} />
                    <span>
                      A conexão foi restabelecida. Você pode agora salvar a ocorrência no banco de dados.
                    </span>
                  </div>
                ) : (
                  <div className="message">
                    <WarningCircleIcon size={22} />
                    <span>
                      Registro de ocorrência salvo localmente. Assim que a conexão voltar, será possível
                      enviar os dados para o banco de dados.
                    </span>
                  </div>
                )}
              </StatusAlert>
            </GridColumn>
          </ResponsiveRow>
        )}


        <PageTitle>Cadastrar Ocorrência</PageTitle>
        <PageSubtitle>Preencha as informações abaixo para registrar a ocorrência.</PageSubtitle>
        <RequiredNotice><span>*</span>Campos obrigatórios</RequiredNotice>
      </PageTopHeader>

      <ResponsiveRow>
        <GridColumn weight={1}>
          <BoxInfo>
            <SectionTitle><FileTextIcon size={22} weight="fill" />Dados Principais</SectionTitle>
            <Grid>
              <Field>
                <label>Número da Ocorrência</label>
                <input type="text" value={numeroOcorrencia} readOnly />
              </Field>
              <Field>
                <label className="required">Data/Hora do Chamado</label>
                <input
                  type="datetime-local"
                  value={dataChamado}
                  readOnly
                />
              </Field>
              <Field>
                <label>Status de Atendimento</label>
                <select value={statusAtendimento} onChange={(e) => {
                  setStatusAtendimento(e.target.value);
                  if (e.target.value !== "Não Atendido") setMotivoNaoAtendimento("");
                }}>
                  <option>Pendente</option>
                  <option>Em andamento</option>
                  <option>Concluída</option>
                  <option>Não Atendido</option>
                </select>
              </Field>

              {statusAtendimento === "Não Atendido" && (
                <FullField>
                  <label>Motivo de Não Atendimento</label>
                  <textarea
                    placeholder="Descreva o motivo pelo qual a ocorrência não foi atendida."
                    value={motivoNaoAtendimento}
                    onChange={(e) => setMotivoNaoAtendimento(e.target.value)}
                  />
                </FullField>
              )}
              <Field>
                <label className="required">Natureza da Ocorrência</label>
                {loadingNaturezas ? (
                  <select disabled>
                    <option>Carregando naturezas...</option>
                  </select>
                ) : (
                  <select
                    value={natureza}
                    onChange={(e) => setNatureza(e.target.value)}
                    required
                  >
                    <option value="">Selecione a natureza</option>
                    {naturezasOcorrencias.map((n) => (
                      <option key={n.id} value={n.id}>
                        {n.nome}
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              <Field>
                <label className="required">Grupo da Ocorrência</label>
                {loadingGrupos ? (
                  <select disabled>
                    <option>Carregando grupos...</option>
                  </select>
                ) : (
                  <select
                    value={grupo}
                    onChange={(e) => setGrupo(e.target.value)}
                    required
                  >
                    <option value="">Selecione o grupo</option>
                    {gruposOcorrencias
                      .filter(g => String(g.naturezaOcorrencia?.id) === String(natureza)) // filtra por natureza
                      .map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.nome}
                        </option>
                      ))}
                  </select>
                )}
              </Field>

              <Field>
                <label className="required">Subgrupo da Ocorrência</label>
                {loadingSubgrupos ? (
                  <select disabled>
                    <option>Carregando subgrupos...</option>
                  </select>
                ) : (
                  <select
                    value={subgrupo}
                    onChange={(e) => setSubgrupo(e.target.value)}
                    required
                  >
                    <option value="">Selecione o subgrupo</option>
                    {subgruposOcorrencias
                      .filter(s => String(s.grupoOcorrencia?.id) === String(grupo)) // filtra por grupo
                      .map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.nome}
                        </option>
                      ))}
                  </select>
                )}
              </Field>

              <Field>
                <label className="required">Forma de acionamento</label>
                <select value={formaAcionamento} onChange={(e) => setFormaAcionamento(e.target.value)}>
                  <option>Telefone</option>
                  <option>Aplicativo</option>
                  <option>Pessoalmente</option>
                </select>
              </Field>

              <Field>
                <label>Evento Especial?</label>
                <select
                  value={eventoEspecial ? "Sim" : "Não"}
                  onChange={(e) => setEventoEspecial(e.target.value === "Sim")}
                  disabled // bloqueado por enquanto
                >
                  <option value="Não">Não</option>
                  <option value="Sim">Sim</option>
                </select>
              </Field>

              <FullField>
                <label>Descrição Resumida</label>
                <textarea
                  placeholder="Ex: Incêndio em veículo na Av. Norte, vítima consciente."
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                />
              </FullField>
            </Grid>
          </BoxInfo>
        </GridColumn>
      </ResponsiveRow>

      <ResponsiveRow>
        <GridColumn weight={1}>
          <BoxInfo>
            <SectionTitle><MapPinIcon size={22} weight="fill" /> Localização</SectionTitle>
            <Grid>
              <Field>
                <label className="required">Município</label>
                {municipios.length > 0 && !forceManualLocationInput ? (
                  <select
                    value={selectedMunicipioId}
                    onChange={(e) => {
                      const id = e.target.value ? Number(e.target.value) : "";
                      setSelectedMunicipioId(id);
                      const nome = municipios.find(m => m.id === id)?.nome || "";
                      setSelectedMunicipioNome(nome);
                    }}
                  >
                    <option value="">Selecione o município (PE)</option>
                    {municipios.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.nome}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input
                    placeholder="Informe o município"
                    value={selectedMunicipioNome}
                    onChange={(e) => setSelectedMunicipioNome(e.target.value)}
                  />
                )}
              </Field>
              <Field>
                <label className="required">Bairro</label>
                {bairros.length > 0 && !forceManualLocationInput ? (
                  <select value={bairro} onChange={(e) => setBairro(e.target.value)}>
                    <option value="">Selecione o bairro</option>
                    {bairros.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                ) : (
                  <input placeholder="Informe o bairro" value={bairro} onChange={(e) => setBairro(e.target.value)} />
                )}
              </Field>
              <Field>
                <label className="required">Logradouro</label>
                <input placeholder="Ex: Av. Norte" value={logradouro} onChange={(e) => setLogradouro(e.target.value)} />
              </Field>
              <Field>
                <label className="required">Número</label>
                <input placeholder="Ex: 458" value={numero} onChange={(e) => setNumero(e.target.value)} />
              </Field>
              <Field>
                <label>Complemento</label>
                <input placeholder="Ex: apt 101" value={complemento} onChange={(e) => setComplemento(e.target.value)} />
              </Field>
              <Field>
                <label>Referência</label>
                <input
                  placeholder="Ex: Em frente ao Hospital Agamenon Magalhães"
                  value={referencia}
                  onChange={(e) => setReferencia(e.target.value)}
                />
              </Field>
              <Field>
                <label>Latitude</label>
                <input
                  value={latitude}
                  onChange={(e) => setLatitude(e.target.value)}
                  placeholder=""
                  readOnly
                />
              </Field>
              <Field>
                <label>Longitude</label>
                <input
                  value={longitude}
                  onChange={(e) => setLongitude(e.target.value)}
                  placeholder=""
                  readOnly
                />
              </Field>
              <Field>
                <label>Localização automática</label>
                <Button
                  text={<><MapPinIcon size={16} style={{ marginRight: 8 }} />Usar Localização</>}
                  onClick={() => {
                    if (!isGeocoding) handleUseLocation();
                  }}
                  style={{ opacity: isGeocoding ? 0.6 : 1, pointerEvents: isGeocoding ? "none" : "auto" }}
                />
              </Field>
            </Grid>
            <Grid>
              <Field>
                <br />
                <MapFullBox>
                  {latitude && longitude ? (
                    <MapContainer
                      center={[Number(latitude), Number(longitude)]}
                      zoom={17}
                      style={{ height: "100%", width: "100%" }}
                      scrollWheelZoom
                    >
                      <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      />
                      <Marker position={[Number(latitude), Number(longitude)]} />
                    </MapContainer>
                  ) : (
                    <MapPlaceholder>
                      Use o botão “Usar Localização” ou preencha os campos obrigatórios
                    </MapPlaceholder>
                  )}
                </MapFullBox>
              </Field>
            </Grid>
          </BoxInfo>
        </GridColumn>
      </ResponsiveRow>

      <ResponsiveRow>
        <GridColumn weight={1}>
          <BoxInfo>
            <SectionTitle><FireTruckIcon size={22} weight="fill" /> Equipes e Viaturas</SectionTitle>
            <Grid>
              <Field>
                <label className="required">Unidade Operacional</label>
                {loadingUnidades ? (
                  <select disabled>
                    <option>Carregando unidades...</option>
                  </select>
                ) : (
                  <select
                    value={unidade}
                    onChange={(e) => setUnidade(e.target.value)}
                    required
                  >
                    <option value="">Selecione a unidade</option>
                    {unidadesOperacionais.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.nome} ({u.pontoBase})
                      </option>
                    ))}
                  </select>
                )}
              </Field>
              {/* 
              <Field>
                <label>Chefe de Ocorrência</label>
                <select value={chefe} onChange={(e) => setChefe(e.target.value)}>
                  <option value="">Escolha o chefe de ocorrência</option>
                  {users.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </Field>
              <Field>
                <label>Líder Militar</label>
                <select value={lider} onChange={(e) => setLider(e.target.value)}>
                  <option value="">Escolha o líder militar</option>
                  {users.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </Field>
              <Field>
                <label>Equipe</Equipe
                <TeamSearchWrapper>
                  <TeamSearchInput
                    placeholder="Digite para buscar membros..."
                    value={teamQuery}
                    onChange={(e) => setTeamQuery(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        if (filteredUsers.length > 0) handleAddToTeam(filteredUsers[0]);
                      }
                    }}
                  />
                  {teamQuery && filteredUsers.length > 0 && (
                    <TeamResults role="listbox">
                      {filteredUsers.map((u) => (
                        <div key={u} onClick={() => handleAddToTeam(u)} role="option" tabIndex={0}>
                          {u}
                        </div>
                      ))}
                    </TeamResults>
                  )}
                </TeamSearchWrapper>
              </Field>
              <Field>
                <TeamBox aria-label="Equipe selecionada">
                  {team.length === 0 ? (
                    <div className="placeholder">Nenhum membro adicionado</div>
                  ) : (
                    team.map((t) => (
                      <TeamChip key={t}>
                        <span>{t}</span>
                        <button type="button" onClick={() => handleRemoveFromTeam(t)} aria-label={`Remover ${t}`}>
                          ✕
                        </button>
                      </TeamChip>
                    ))
                  }
                </TeamBox>
              </Field>
              <Field>
                <label>Ponto Base</label>
                <select value={pontoBase} onChange={(e) => setPontoBase(e.target.value)}>
                  <option value="">Selecione ponto base no acionamento</option>
                  <option>Voltando para a base</option>
                  <option>Na base</option>
                  <option>Em deslocamento</option>
                </select>
              </Field>
              
              <Field>
                <label>Viatura Utilizada</label>
                <select value={viaturaUtilizada} onChange={(e) => setViaturaUtilizada(e.target.value)}>
                  <option value="">Selecione o tipo de viatura utilizada</option>
                  <option>Auto Bomba</option>
                  <option>Auto Resgate</option>
                  <option>Auto Tanque</option>
                  <option>Auto Socorro</option>
                  <option>Motocicleta</option>
                </select>
              </Field>
              */}
              <Field>
                <label className="required">Número da Viatura</label>
                {loadingNumeracaoViatura ? (
                  <select disabled>
                    <option>Carregando viaturas...</option>
                  </select>
                ) : (
                  <select
                    value={numeracaoViatura}
                    onChange={(e) => setNumeracaoViatura(e.target.value)}
                    required
                  >
                    <option value="">Selecione a numeração da viatura</option>
                    {viaturas.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.tipo} - {v.numero}
                      </option>
                    ))}
                  </select>
                )}
                
              </Field>
            </Grid>
          </BoxInfo>
        </GridColumn>
      </ResponsiveRow>

      <ResponsiveRow>
        <GridColumn weight={1}>
          <BoxInfo>
            <SectionTitle><UserIcon size={22} weight="fill" /> Vítimas e Pessoas Envolvidas</SectionTitle>
            <BoxInfo>
              <Grid>
                {pessoas.length === 0 && (
                  <div style={{ gridColumn: "1 / -1", color: "#64748b", padding: 12, justifyContent: "center", display: "flex" }}>
                    Nenhuma pessoa adicionada
                  </div>
                )}
                {pessoas.map((p, idx) => (
                  <PersonCard key={p.id}>
                    <PersonCardHeader>
                      <strong>Pessoa {idx + 1}</strong>
                      <PersonRemoveButton
                        type="button"
                        onClick={() => removePessoa(p.id)}
                      >
                        Remover
                      </PersonRemoveButton>
                    </PersonCardHeader>
                    <Grid>
                      <Field>
                        <label>Nome Completo</label>
                        <input value={p.nome} onChange={(e) => updatePessoa(p.id, { nome: e.target.value })} />
                      </Field>
                      <Field>
                        <label>Idade</label>
                        <input
                          type="number"
                          value={p.idade ?? ""}
                          onChange={(e) =>
                            updatePessoa(p.id, { idade: e.target.value === "" ? undefined : Number(e.target.value) })
                          }
                        />
                      </Field>
                      <Field>
                        <label>Sexo</label>
                        <select
                          value={p.sexo || ""}
                          onChange={(e) => updatePessoa(p.id, { sexo: e.target.value })}
                        >
                          <option value="">Selecione o sexo</option>
                          <option value="masculino">Masculino</option>
                          <option value="feminino">Feminino</option>
                          <option value="outro">Outro</option>
                        </select>
                      </Field>
                      <Field>
                        <label>Etnia</label>
                        <select
                          value={p.etnia || ""}
                          onChange={(e) => updatePessoa(p.id, { etnia: e.target.value })}
                        >
                          <option value="">Selecione a etnia</option>
                          <option value="branca">Branca</option>
                          <option value="preta">Preta</option>
                          <option value="parda">Parda</option>
                          <option value="amarela">Amarela</option>
                          <option value="indigena">Indígena</option>
                          <option value="outro">Outro</option>
                        </select>
                      </Field>
                      <Field>
                        <label>CPF</label>
                        <input
                          type="text"
                          placeholder="000.000.000-00"
                          value={p.cpf}
                          onChange={(e) => updatePessoa(p.id, { cpf: formatCPF(e.target.value) })}
                          maxLength={14}
                        />
                      </Field>
                      <Field>
                        <label>Tipo de Atendimento</label>
                        <input value={p.tipoAtendimento || ""} onChange={(e) => updatePessoa(p.id, { tipoAtendimento: e.target.value })} />
                      </Field>
                      <Field>
                        <label className="required">Condição</label>
                        {loadingCondicaoVitima ? (
                          <select disabled>
                            <option>Carregando condição da vítima...</option>
                          </select>
                        ) : (
                          <select
                            value={p.condicao || ""}
                            onChange={(e) => updatePessoa(p.id, { condicao: e.target.value })}
                            required
                          >
                            <option value="">Selecione</option>
                            {condicoesVitima.map((n) => (
                              <option key={n.id} value={n.id}>
                                {n.tipoLesao}
                              </option>
                            ))}
                          </select>
                        )}
                      </Field>
                      <Field>
                        <label>Destino da Vítima</label>
                        <input
                          value={p.destinoVitima || ""}
                          onChange={(e) => updatePessoa(p.id, { destinoVitima: e.target.value })}
                        />
                      </Field>
                      <FullField>
                        <label>Observações</label>
                        <textarea
                          placeholder="Anotações sobre a pessoa, estado, etc."
                          value={p.observacoes || ""}
                          onChange={(e) => updatePessoa(p.id, { observacoes: e.target.value })}
                        />
                      </FullField>
                    </Grid>
                  </PersonCard>
                ))}
                <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "center" }}>
                  <Button text="+ Adicionar Pessoa" onClick={addPessoa} />
                </div>
              </Grid>
            </BoxInfo>
          </BoxInfo>
        </GridColumn>
      </ResponsiveRow>

      <ResponsiveRow>
        <GridColumn weight={1}>
          <BoxInfo>
            <SectionTitle><PaperclipIcon size={22} weight="fill" /> Anexos e Evidências</SectionTitle>
            <SectionSubtitle>Fotos e Arquivos</SectionSubtitle>
            <UploadArea
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const files = e.dataTransfer.files;
                handleFileUpload(files);
              }}
            >
              <p>Arraste arquivos aqui ou clique para selecionar</p>
              <input
                type="file"
                accept="image/*,application/pdf"
                multiple
                capture="environment"
                onChange={(e) => handleFileUpload(e.target.files)}
              />
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

            <Divider />
            <SectionSubtitle>Assinatura do Responsável</SectionSubtitle>
            <SignatureBox>
              <canvas
                ref={signatureCanvasRef}
                width={window.innerWidth < 480 ? 300 : 500}
                height={200}
                onPointerDown={startDrawing}
                onPointerMove={draw}
                onPointerUp={endDrawing}
                onPointerCancel={endDrawing}
              />
              <SignatureActions>
                <Button variant="secondary" text="Limpar" onClick={clearSignature} />
                <Button text="Abrir tela maior" onClick={() => setSignatureModalOpen(true)} />
              </SignatureActions>
            </SignatureBox>
            {signatureModalOpen && (
              <ModalOverlay>
                <ModalContent>
                  {/* marker CSS usado no preventTouch acima */}
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
          </BoxInfo>
        </GridColumn>
      </ResponsiveRow>
{/*
      <ResponsiveRow>
        <GridColumn weight={1}>
          <BoxInfo>
            <SectionTitle><GearIcon size={22} weight="fill" /> Detalhes Operacionais</SectionTitle>
            <Grid>
              <Field>
                <label>Tempo Estimado de Resposta (min)</label>
                <input value={tempoResposta} onChange={(e) => setTempoResposta(e.target.value)} />
              
                </Field>
              <FullField>
                <label>Observações Adicionais</label>
                <textarea
                  placeholder="Anotações internas, detalhes específicos da operação..."
                  value={observacoesAdicionais}
                  onChange={(e) => setObservacoesAdicionais(e.target.value)}
                />
                
              </FullField>
            </Grid>
          </BoxInfo>
        </GridColumn>
      </ResponsiveRow>
*/}
      {/* Informações de auditoria
      <ResponsiveRow>
        <GridColumn weight={1}>
          <BoxInfo>
            <SectionTitle><ClipboardTextIcon size={22} weight="fill" /> Informações de Auditoria</SectionTitle>
            <Grid>
              <Field><label>Atendente Responsável</label><input value={usuarioLogado.nome} readOnly /></Field>
              <Field><label>Data/Hora do Registro</label><input value="29/09/2025 12:33" readOnly /></Field>
              <Field><label>IP de Origem</label><input value="192.167.2.100" readOnly /></Field>
            </Grid>
          </BoxInfo>
        </GridColumn>
      </ResponsiveRow>
*/}

      <ResponsiveRow>
        <GridColumn weight={1}>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
            <Button
              text="Limpar"
              type="button"
              variant="secondary"
              onClick={() => {
                try {
                  localStorage.removeItem(CACHE_KEY);
                  sessionStorage.removeItem(CACHE_KEY);
                  setOfflineOccurrences([]);
                  alert("Dados do localStorage e sessionStorage foram limpos.");
                } catch (err) {
                  console.error("Erro ao limpar armazenamento:", err);
                  alert("Não foi possível limpar o armazenamento.");
                }
              }}
              style={{ padding: "8px 14px", borderRadius: 6 }}
            />
            <Button
              text="Salvar Ocorrência"
              type="button"
              variant="danger"
              onClick={async () => {
                try {
                  // 1) enviar assinatura (se houver) com nome contendo o número da ocorrência
                  let assinaturaUrl: string | undefined = undefined;
                  if (signatureCanvasRef.current) {
                    const canvas = signatureCanvasRef.current;
                    const dataURL = canvas.toDataURL("image/png");
                    const blob = await (await fetch(dataURL)).blob();
                    const assinaturaFileName = `assinatura${numeroOcorrencia}.png`;
                    const file = new File([blob], assinaturaFileName, { type: "image/png" });
                    assinaturaUrl = await uploadToCloudinary(file);
                  }

                  // 2) garantir que todos os arquivos tenham URL (uploadar os que ainda não têm)
                  const uploadedResults = await Promise.all(
                    uploadedFiles.map(async (f) => {
                      const url = f.url ?? (f.file ? await uploadToCloudinary(f.file) : undefined);
                      return { ...f, url };
                    })
                  );

                  // 3) montar array de anexos com metadados
                  const anexos = uploadedResults
                    .filter((u) => u.url)
                    .map((u) => {
                      const ext = (u.name || "").split(".").pop()?.toLowerCase() || "";
                      const tipoArquivo = ext === "pdf" ? "arquivo" : "imagem";
                      return {
                        tipoArquivo,
                        urlArquivo: u.url,
                        nomeArquivo: u.name,
                        extensaoArquivo: ext,
                        descricao: "",
                      };
                    });

                  // incluir assinatura também como anexo (se foi enviada)
                  if (assinaturaUrl) {
                    anexos.push({
                      tipoArquivo: "assinatura",
                      urlArquivo: assinaturaUrl,
                      nomeArquivo: `${numeroOcorrencia}.png`,
                      extensaoArquivo: "png",
                      descricao: "Assinatura do responsável",
                    });
                  }

                  // 4) montar payload conforme exemplo desejado
                  const mapStatus = (s: string) => {
                    switch (s) {
                      case "Pendente":
                        return "pendente";
                      case "Em andamento":
                        return "em_andamento";
                      case "Concluída":
                        return "concluida";
                      case "Não Atendido":
                        return "nao_atendido";
                      default:
                        return String(s).toLowerCase().replace(/\s+/g, "_");
                    }
                  };

                  const payload = {
                    numeroOcorrencia: numeroOcorrencia,
                    dataHoraChamada: dataChamado ? new Date(dataChamado).toISOString() : new Date().toISOString(),
                    statusAtendimento: mapStatus(statusAtendimento),
                    // conforme solicitado sempre "N/A"
                    motivoNaoAtendimento: "N/A",
                    descricao: descricao || "",
                    formaAcionamento: (formaAcionamento || "Telefone").toLowerCase(),
                    dataSincronizacao: new Date().toISOString(),

                    // usuário fixo conforme solicitado
                    usuarioId: usuarioLogado.id,
                    condicaoVitimaId: condicoesVitima.length > 0 ? Number(condicoesVitima[0]) : undefined,
                    unidadeOperacionalId: unidade ? Number(unidade) : undefined,
                    naturezaOcorrenciaId: natureza ? Number(natureza) : undefined,
                    grupoOcorrenciaId: grupo ? Number(grupo) : undefined,
                    subgrupoOcorrenciaId: subgrupo ? Number(subgrupo) : undefined,
                    viaturaId: numeracaoViatura ? Number(numeracaoViatura) : undefined,
                    eventoEspecialId: eventoEspecial ? 1 : undefined,

                    localizacao: {
                      municipio: selectedMunicipioNome || "",
                      bairro: bairro || "",
                      logradouro: logradouro || "",
                      numero: numero || "",
                      complemento: complemento || "",
                      pontoReferencia: referencia || "",
                      latitude: latitude ? Number(latitude) : undefined,
                      longitude: longitude ? Number(longitude) : undefined,
                    },

                    anexos: Array.isArray(anexos)
                      ? anexos.map((u: any) => ({
                        tipoArquivo: u.tipoArquivo,
                        urlArquivo: u.urlArquivo,
                        nomeArquivo: u.nomeArquivo,
                        extensaoArquivo: u.extensaoArquivo,
                        descricao: u.descricao || "",
                      }))
                      : [],

                    // campos auxiliares/optativos
                    assinatura: assinaturaUrl || undefined,
                    tempoResposta: tempoResposta || undefined,
                    observacoes: observacoesAdicionais || undefined,
                  };


                  // 5) salvar localmente (fila offline) — opcional manter
                  const saved = saveOffline(payload);
                  setOfflineOccurrences(getOfflineOccurrences());

                  console.log(payload)

                  // 6) se online, enviar para backend e remover da fila
                  if (isOnline) {
                    const response = await axios.post("https://backend-chama.up.railway.app/ocorrencias", payload, {
                      headers: { "Content-Type": "application/json" },
                    });
                    console.log("Ocorrência enviada:", response.data);

                    // tentar extrair id da ocorrência retornada
                    const ocorrenciaId = response.data?.id ?? response.data?.ocorrenciaId ?? undefined;

                    // remover item salvo localmente
                    const updatedOffline = getOfflineOccurrences().filter((o: any) => o.id !== saved?.id);
                    localStorage.setItem(CACHE_KEY, JSON.stringify(updatedOffline));
                    setOfflineOccurrences(updatedOffline);

                    // enviar vítimas (se houver) para a API de vítimas
                    if (Array.isArray(pessoas) && pessoas.length > 0) {
                      // mapeador simples para sexo
                      const mapSexo = (s?: string) => {
                        if (!s) return undefined;
                        const low = s.toString().toLowerCase();
                        if (low.startsWith("m")) return "M";
                        if (low.startsWith("f")) return "F";
                        return "O";
                      };

                      const vitimasPayloads = pessoas.map((p) => ({
                        cpfVitima: p.cpf || "",
                        nome: p.nome || "",
                        idade: p.idade ?? undefined,
                        sexo: mapSexo(p.sexo),
                        tipoAtendimento: p.tipoAtendimento || undefined,
                        observacoes: p.observacoes || undefined,
                        etnia: p.etnia || undefined,
                        destinoVitima: p.destinoVitima || undefined,
                        ocorrenciaId: ocorrenciaId,
                        lesaoId: p.condicao ? Number(p.condicao) : (p.condicaoVitima ?? undefined),
                      }));

                      try {
                        // POST paralelo das vítimas
                        const results = await Promise.all(
                          vitimasPayloads.map((vp) =>
                            axios.post("https://backend-chama.up.railway.app/vitimas/", vp, {
                              headers: { "Content-Type": "application/json" },
                            })
                          )
                        );
                        console.log("Vítimas enviadas:", results.map(r => r.data));
                      } catch (err) {
                        console.error("Erro ao enviar vítimas:", err);
                        alert("Ocorrência enviada, mas falha ao enviar vítimas. Verifique o console.");
                      }
                    }
                  } else {
                    alert("Sem internet. Ocorrência salva offline.");
                  }

                  alert("Ocorrência salva com sucesso!");
                } catch (err) {
                  console.error("Erro ao salvar ocorrência:", err);
                  alert("Falha ao salvar a ocorrência. Confira o console para detalhes.");
                }
              }}
            />
          </div>
        </GridColumn>
      </ResponsiveRow>
    </ContainerPainel>
  );
}