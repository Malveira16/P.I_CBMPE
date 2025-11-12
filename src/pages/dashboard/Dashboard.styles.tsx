import styled from "styled-components";
import { AuditStatCard, BoxInfo } from "../../components/EstilosPainel.styles";

export const DashboardAlert = styled(BoxInfo)`
  background-color: #ffc5c5ff;
  border-color: #ff8989ff;
  margin-bottom: 1.5rem;
`;

export const AlertContent = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

export const AlertIndicator = styled.div`
  width: 4px;
  background-color: #fc1212ff;
  border-radius: 2px;
  align-self: stretch;
`;

export const AlertText = styled.div`
  flex: 1;
  
  strong {
    color: #920e0eff;
  }
  
  div {
    color: #da1313ff;
    font-size: 14px;
    margin-top: 4px;
  }
`;

export const MetricCard = styled(AuditStatCard)`
  text-align: center;
  
  h3 {
    font-size: 2.5rem;
    margin: 0;
    color: #1F2937;
  }
  
  span {
    font-size: 14px;
    color: #6B7280;
  }
`;

export const MetricTrend = styled.div<{ trend: 'up' | 'down' | 'neutral' }>`
  font-size: 12px;
  margin-top: 8px;
  color: ${props => 
    props.trend === 'up' ? '#EF4444' : 
    props.trend === 'down' ? '#10B981' : 
    '#6B7280'};
`;

export const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

export const PeriodButtons = styled.div`
  display: flex;
  gap: 8px;
`;

export const GraficoBarrasContainer = styled.div`
  display: flex;
  align-items: end;
  gap: 8px;
  height: 90px;
  position: relative;
  padding-left: 30px;
  margin-top: 1rem;
`;

export const EixoYBarras = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 20px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-right: 8px;
  border-right: 1px solid #e2e8f0;
  width: 25px;
`;

export const ValorEixoYBarras = styled.div`
  font-size: 10px;
  color: #6B7280;
  text-align: right;
  transform: translateY(50%);
`;

export const BarrasContainer = styled.div`
  display: flex;
  align-items: end;
  gap: 8px;
  flex: 1;
  height: 60px;
`;

export const BarChartColumn = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
`;

export const Bar = styled.div<{ height: number; color?: string }>`
  height: ${props => props.height}px;
  background-color: ${props => props.color || '#fc1212ff'};
  width: 100%;
  max-width: 70px;
  border-radius: 4px 4px 0 0;
  min-height: 4px;
`;

export const BarLabel = styled.span`
  font-size: 10px;
  margin-top: 4px;
  color: #6b7280;
`;

export const PieChartContainer = styled.div`
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto;
`;

export const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
`;

export const LegendColor = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  background-color: ${props => props.color};
  border-radius: 2px;
`;

export const LegendText = styled.span`
  flex: 1;
  text-align: left;
`;

export const LegendValue = styled.span`
  font-weight: 600;
`;

export const StatsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  margin-top: 1rem;
`;

export const StatItem = styled.div`
  text-align: center;
  
  div:first-child {
    font-size: 2rem;
    font-weight: bold;
    color: #1F2937;
  }
  
  div:last-child {
    font-size: 14px;
    color: #6B7280;
  }
`;

export const GraficoRegiaoContainer = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 0.5rem;
  margin-top: 1.5rem;
  overflow-x: auto;
  padding: 1rem;
  position: relative;

  @media (max-width: 600px) {
    gap: 0.25rem;
    padding: 0.5rem;
  }
`;

export const EixoY = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 30px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding-right: 10px;
  border-right: 1px solid #e2e8f0;
`;

export const ValorEixoY = styled.div`
  font-size: 10px;
  color: #6B7280;
  transform: translateY(50%);
`;

export const BarraRegiaoContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
`;

export const BarraRegiao = styled.div<{ altura: number }>`
  height: ${props => props.altura}px;
  background-color: #fc1212ff;
  width: 70px;
  border-radius: 4px 4px 0 0;
  min-height: 4px;
`;

export const ValorBarra = styled.div`
  font-size: 12px;
  color: #1F2937;
  margin-top: 8px;
  font-weight: 600;
`;

export const NomeRegiao = styled.div`
  font-size: 11px;
  color: #6B7280;
  margin-top: 4px;
  text-align: center;
`;

type GraficoPizzaProps = {
  dados: { label: string; value: number }[];
  cores?: string[];
  tamanho?: number; // largura/altura do gráfico
};

export function GraficoPizza({ dados, cores = [], tamanho = 200 }: GraficoPizzaProps) {
  const total = dados.reduce((sum, d) => sum + d.value, 0);
  let acumulado = 0;

  // gerar o gradiente
  const gradiente = dados.length === 0 ? '#e5e7eb' : dados.map((d, i) => {
    const start = (acumulado / total) * 360;
    const end = ((acumulado + d.value) / total) * 360;
    acumulado += d.value;
    return `${cores[i % cores.length] || '#ccc'} ${start}deg ${end}deg`;
  }).join(',');

  return (
    <PizzaContainer>
      <PizzaCircle tamanho={tamanho} gradiente={gradiente} />
      <Legenda>
        {dados.map((d, i) => (
          <LegendaItem key={d.label}>
            <LegendaCor cor={cores[i % cores.length] || '#ccc'} />
            <span>{d.label}: {d.value} ({total > 0 ? ((d.value / total) * 100).toFixed(1) : 0}%)</span>
          </LegendaItem>
        ))}
      </Legenda>
    </PizzaContainer>
  );
}

// ===== STYLED COMPONENTS =====

const PizzaContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const PizzaCircle = styled.div<{ tamanho: number; gradiente: string }>`
  width: ${({ tamanho }) => tamanho}px;
  height: ${({ tamanho }) => tamanho}px;
  border-radius: 50%;
  background: ${({ gradiente }) => `conic-gradient(${gradiente})`};
`;

const Legenda = styled.div`
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  font-size: 12px;
`;

const LegendaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LegendaCor = styled.span<{ cor: string }>`
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${({ cor }) => cor};
`;
