// src/components/SignaturePadBetter.tsx
import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
} from "react-native";
import Signature from "react-native-signature-canvas";
import Button from "./Button";

interface SignaturePadProps {
  title: string;
  buttonText: string;
  onSave: (signatureData: string) => void;
  required?: boolean;
}

const SignaturePad: React.FC<SignaturePadProps> = ({
  title,
  buttonText,
  onSave,
  required = false,
}) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const signatureRef = useRef<any>(null);

  const { width: screenWidth } = Dimensions.get("window");
  const canvasWidth = screenWidth - 80;
  const canvasHeight = 200;

  const handleOK = (signature: string) => {
    onSave(signature);
    setHasSignature(true);
    setModalVisible(false);
  };

  const handleClear = () => {
    signatureRef.current?.clearSignature();
    setHasSignature(false);
  };

  const handleConfirm = () => {
    signatureRef.current?.readSignature();
  };

  const handleClose = () => {
    setModalVisible(false);
  };

  const style = `
    .m-signature-pad--footer { display: none; margin: 0px; }
    .m-signature-pad { box-shadow: none; border: none; }
    body, html { margin: 0; padding: 0; }
  `;

  return (
    <View style={styles.container}>
      <Button
        title={buttonText}
        onPress={() => setModalVisible(true)}
        variant="secondary"
        style={styles.signatureButton}
      />

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={handleClose}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                <Text style={styles.closeButtonText}>×</Text>
              </TouchableOpacity>
            </View>

            {/* Signature Area */}
            <View style={styles.signatureArea}>
              <Text style={styles.instructionText}>
                Desenhe sua assinatura na área abaixo
              </Text>
              
              <View style={[styles.signaturePad, { width: canvasWidth, height: canvasHeight }]}>
                <Signature
                  ref={signatureRef}
                  onOK={handleOK}
                  onEmpty={() => setHasSignature(false)}
                  onClear={() => setHasSignature(false)}
                  descriptionText=""
                  clearText="Limpar"
                  confirmText="Confirmar"
                  webStyle={style}
                  backgroundColor="white"
                  penColor="black"
                  imageType="image/png"
                />
              </View>
            </View>

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <Button
                title="Limpar"
                onPress={handleClear}
                variant="secondary"
                style={styles.footerButton}
              />
              <Button
                title="Confirmar"
                onPress={handleConfirm}
                variant="primary"
                style={styles.footerButton}
                disabled={required && !hasSignature}
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

// Use the same styles as above, just change the component name
const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  signatureButton: {
    alignSelf: "flex-start",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    borderRadius: 12,
    width: "90%",
    maxHeight: "80%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: "#6b7280",
  },
  signatureArea: {
    padding: 16,
  },
  instructionText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 16,
  },
  signaturePad: {
    backgroundColor: "white",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    overflow: "hidden",
  },
  modalFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  footerButton: {
    flex: 1,
    marginHorizontal: 8,
  },
});

export default SignaturePad;