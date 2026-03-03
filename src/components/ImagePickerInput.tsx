import React, { useState, forwardRef, useImperativeHandle } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  ScrollView,
  Alert,
  ActivityIndicator,
} from "react-native";
import * as DocumentPicker from 'expo-document-picker';
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface ImagePickerInputProps {
  label?: string;
  images: any[];
  setImages: (images: any[]) => void;
  maxImages?: number;
  required?: boolean;
}

export interface ImagePickerInputRef {
  validate: () => boolean;
}

// Sub-componente para gerenciar o loading individual de cada imagem
const ThumbnailWithLoading = ({ uri, isPdf }: { uri: string; isPdf: boolean }) => {
  const [loading, setLoading] = useState(true);

  if (isPdf) {
    return (
      <View style={[styles.thumbnail, styles.pdfContainer]}>
        <MaterialCommunityIcons name="file-pdf-box" size={40} color="#dc3545" />
        <Text style={styles.pdfText}>PDF</Text>
      </View>
    );
  }

  return (
    <View style={styles.thumbnail}>
      <Image
        source={{ uri }}
        style={styles.thumbnailImage}
        onLoadEnd={() => setLoading(false)}
      />
      {loading && (
        <ActivityIndicator
          style={styles.absoluteLoader}
          color="#270984"
          size="small"
        />
      )}
    </View>
  );
};

const ImagePickerInput = forwardRef<ImagePickerInputRef, ImagePickerInputProps>(
  ({ label, images, setImages, maxImages = 9, required = false }, ref) => {
    const [error, setError] = useState(false);
    const [isPicking, setIsPicking] = useState(false); // Spinner para o botão

    useImperativeHandle(ref, () => ({
      validate: () => {
        const isValid = !required || images.length > 0;
        setError(!isValid);
        return isValid;
      },
    }));

    const pickDocument = async () => {
      if (images.length >= maxImages) {
        Alert.alert(
          "Limite atingido",
          `Você pode selecionar no máximo ${maxImages} arquivos.`
        );
        return;
      }

      try {
        setIsPicking(true);
        // DocumentPicker é mais confiável para PDFs no Android
        const result = await DocumentPicker.getDocumentAsync({
          type: ["image/*", "application/pdf"],
          multiple: true,
          copyToCacheDirectory: true,
        });

        if (!result.canceled) {
          // Filtra para não exceder o limite máximo
          const availableSlots = maxImages - images.length;
          const newAssets = result.assets.slice(0, availableSlots);
          
          setImages([...images, ...newAssets]);
          setError(false);
        }
      } catch (err) {
        Alert.alert("Erro", "Não foi possível selecionar os arquivos.");
      } finally {
        setIsPicking(false);
      }
    };

    const removeImage = (index: number) => {
      const newImages = [...images];
      newImages.splice(index, 1);
      setImages(newImages);
    };

    return (
      <View style={styles.container}>
        {label && (
          <View style={styles.labelContainer}>
            {required && <View style={styles.requiredDot} />}
            <Text style={styles.label}>{label}</Text>
          </View>
        )}

        <TouchableOpacity
          onPress={pickDocument}
          disabled={isPicking}
          style={[styles.pickerButton, error && styles.errorBorder]}
        >
          {isPicking ? (
            <ActivityIndicator color="#270984" />
          ) : (
            <>
              <MaterialCommunityIcons
                name="file-plus"
                size={24}
                color="#270984"
              />
              <Text style={styles.pickerText}>
                Anexar Arquivos ({images.length}/{maxImages})
              </Text>
            </>
          )}
        </TouchableOpacity>

        {images.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.previewScroll}
          >
            {images.map((img, index) => {
              const isPdf = img.mimeType?.includes("pdf") || img.name?.toLowerCase().endsWith(".pdf") || img.uri.toLowerCase().endsWith(".pdf");
              
              return (
                <View key={index} style={styles.imageWrapper}>
                  <ThumbnailWithLoading uri={img.uri} isPdf={!!isPdf} />
                  
                  <TouchableOpacity
                    style={styles.removeBadge}
                    onPress={() => removeImage(index)}
                  >
                    <MaterialCommunityIcons
                      name="close-circle"
                      size={20}
                      color="#dc3545"
                    />
                  </TouchableOpacity>
                </View>
              );
            })}
          </ScrollView>
        )}
        {error && (
          <Text style={styles.errorText}>Selecione ao menos um arquivo.</Text>
        )}
      </View>
    );
  }
);

ImagePickerInput.displayName = "ImagePickerInput";

const styles = StyleSheet.create({
  container: { marginBottom: 16 },
  labelContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  requiredDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#dc3545",
    marginRight: 6,
  },
  label: { fontSize: 16, fontWeight: "600", color: "#333" },
  pickerButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ced4da",
    borderRadius: 8,
    paddingVertical: 12,
    borderStyle: "dashed",
    minHeight: 52,
  },
  pickerText: { marginLeft: 8, color: "#270984", fontWeight: "bold" },
  errorBorder: { borderColor: "#dc3545" },
  errorText: { color: "#dc3545", fontSize: 12, marginTop: 4 },
  previewScroll: { marginTop: 12 },
  imageWrapper: { marginRight: 10, position: "relative", paddingTop: 5 },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f9f9f9",
  },
  thumbnailImage: {
    width: "100%",
    height: "100%",
  },
  pdfContainer: {
    backgroundColor: "#fff5f5",
  },
  pdfText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#dc3545",
    marginTop: -4,
  },
  absoluteLoader: {
    position: "absolute",
  },
  removeBadge: {
    position: "absolute",
    top: -2,
    right: -5,
    backgroundColor: "#fff",
    borderRadius: 10,
    zIndex: 10,
  },
});

export default ImagePickerInput;