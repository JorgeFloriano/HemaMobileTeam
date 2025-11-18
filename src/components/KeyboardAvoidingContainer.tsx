// src/components/KeyboardAvoidingContainer.tsx
import React from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Pressable,
  Keyboard,
  StyleSheet,
  StatusBar,
} from "react-native";

interface KeyboardAvoidingContainerProps {
  children: React.ReactNode;
}

const KeyboardAvoidingContainer: React.FC<KeyboardAvoidingContainerProps> = ({
  children,
}) => {
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0} // Adjust this value as needed
    >
      <Pressable onPress={Keyboard.dismiss} style={styles.pressableContainer}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled" // Important for nested touchables
        >
          {children}
        </ScrollView>
      </Pressable>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
   pressableContainer: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    //paddingTop: Platform.OS === "ios" ? 44 : StatusBar.currentHeight || 0, // Navbar height
    paddingBottom: 40,
  },
});

export default KeyboardAvoidingContainer;
