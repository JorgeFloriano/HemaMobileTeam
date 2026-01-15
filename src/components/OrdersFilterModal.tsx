import {
  Modal,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import OptionSelector from "./OptionSelector";
import DateInput from "./DateInput";
import Button from "./Button";

// Interface para o estado interno de filtros
interface FilterState {
  client_id: string;
  tec_id: string;
  finished: string;
  date_start: string;
  date_end: string;
  date_type: "order_open_date" | "last_note_date"; // Tipagem estrita para o tipo de data
}

interface OrdersFilterModalProps {
  visible: boolean;
  filters: FilterState; // Recebe os filtros
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>; // Recebe a função de alteração
  onClose: () => void;
  onApply: (filters: FilterState) => void;
  onClear: () => void; // Nova prop para limpar
  clients: any[];
  tecs: any[];
}

const OrdersFilterModal: React.FC<OrdersFilterModalProps> = ({
  visible,
  filters,
  setFilters,
  onClose,
  onApply,
  onClear,
  clients,
  tecs,
}) => {

  const statusOptions = [
    { id: "2", description: "SATs (todas)" },
    { id: "0", description: "Não Finalizadas" },
    { id: "1", description: "Finalizadas" },
  ];

  const dateTypeOptions = [
    { id: "order_open_date", description: "Data de abertura" },
    { id: "last_note_date", description: "Última anotação" },
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Filtrar Solicitações</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeText}>×</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body}>
            {/* Status (Select) */}
            <OptionSelector
              label="Status"
              options={statusOptions}
              selectedId={filters.finished}
              onSelect={(opt) => setFilters({ ...filters, finished: opt.id })}
            />

            {/* Clientes (Select) - Remapeando dados da API para o componente */}
            <OptionSelector
              label="Cliente"
              placeholder="Todos os clientes"
              options={clients.map((c: any) => ({
                id: c.id.toString(),
                description: c.name,
              }))}
              selectedId={filters.client_id}
              onSelect={(opt) => setFilters({ ...filters, client_id: opt.id })}
            />

            {/* Técnico (Select) */}
            <OptionSelector
              label="Técnico"
              placeholder="Todos os técnicos"
              options={tecs.map((t: any) => ({
                id: t.id.toString(),
                description: t.user.name || "Não identificado",
              }))}
              selectedId={filters.tec_id}
              onSelect={(opt) => setFilters({ ...filters, tec_id: opt.id })}
            />

            {/* Tipo de Data */}
            <OptionSelector
              label="Filtrar data por"
              options={dateTypeOptions}
              selectedId={filters.date_type}
              onSelect={(opt) =>
                setFilters({
                  ...filters,
                  // Usamos o 'as' para garantir ao TS que este ID é um dos tipos válidos
                  date_type: opt.id as "order_open_date" | "last_note_date",
                })
              }
            />

            {/* Datas */}
            <View style={styles.row}>
              <DateInput
                label="De"
                containerStyle={{ flex: 1, marginRight: 8 }}
                value={filters.date_start}
                onChangeText={(val) =>
                  setFilters({ ...filters, date_start: val })
                }
              />
              <DateInput
                label="Até"
                containerStyle={{ flex: 1 }}
                value={filters.date_end}
                onChangeText={(val) =>
                  setFilters({ ...filters, date_end: val })
                }
              />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Button
              title="Limpar"
              variant="secondary"
              onPress={onClear} // Chama a função que resetamos no pai
              style={{ flex: 1 }}
            />
            <Button
              title="Filtrar"
              variant="primary"
              onPress={() => onApply(filters)}
              style={{ flex: 2, marginLeft: 10 }}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  content: {
    backgroundColor: "white",
    borderRadius: 12,
    width: "90%",
    maxHeight: "100%",
    overflow: "hidden",
  },
  header: {
    padding: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "center",
  },
  title: { fontSize: 18, fontWeight: "bold" },
  closeText: { fontSize: 30, color: "#999", marginTop: -10 },
  body: { padding: 20 },
  footer: {
    flexDirection: "row",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  row: { flexDirection: "row" },
});

export default OrdersFilterModal;
