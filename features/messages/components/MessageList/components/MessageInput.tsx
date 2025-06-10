import React from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  ActionSheetIOS,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles, colors } from '../styles/MessageList.styles';

interface MessageInputProps {
  newMessage: string;
  setNewMessage: (message: string) => void;
  handleSend: () => void;
  handlePickImage: () => void;
  handleCaptureImage?: () => void;
  isUploading: boolean;
  isPending: boolean;
  disabled?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  setNewMessage,
  handleSend,
  handlePickImage,
  handleCaptureImage,
  isUploading,
  isPending,
  disabled = false,
}) => {
  // Function to handle image option selection on iOS
  const handleImageOptions = () => {
    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: ['Cancel', 'Take Photo', 'Choose from Library'],
          cancelButtonIndex: 0,
        },
        (buttonIndex) => {
          if (buttonIndex === 1) {
            handleCaptureImage?.();
          } else if (buttonIndex === 2) {
            handlePickImage();
          }
        }
      );
    } else {
      // For Android we use separate buttons
      handlePickImage();
    }
  };

  const isButtonDisabled = isUploading || disabled;
  const buttonColor = isButtonDisabled ? '#ccc' : colors.primary;

  return (
    <View
      style={[
        styles.messageInputContainer,
        disabled && styles.messageInputDisabled,
      ]}
    >
      {Platform.OS === 'ios' ? (
        // For iOS, show a single button that opens action sheet
        <TouchableOpacity
          style={styles.mediaButton}
          onPress={handleImageOptions}
          disabled={isButtonDisabled}
        >
          <Ionicons name="image" size={24} color={buttonColor} />
        </TouchableOpacity>
      ) : (
        // For Android, show two separate buttons
        <>
          <TouchableOpacity
            style={styles.mediaButton}
            onPress={handlePickImage}
            disabled={isButtonDisabled}
          >
            <Ionicons name="images-outline" size={22} color={buttonColor} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.mediaButton}
            onPress={handleCaptureImage}
            disabled={isButtonDisabled}
          >
            <Ionicons name="camera-outline" size={24} color={buttonColor} />
          </TouchableOpacity>
        </>
      )}

      <TextInput
        style={[styles.input, disabled && styles.inputDisabled]}
        value={newMessage}
        onChangeText={setNewMessage}
        placeholder="Type a message..."
        multiline
        maxLength={1000}
        editable={!disabled}
      />

      {isUploading ? (
        <View style={[styles.sendButton, disabled && { opacity: 0.5 }]}>
          <ActivityIndicator size="small" color="#fff" />
        </View>
      ) : (
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!newMessage.trim() || disabled) && { opacity: 0.5 },
          ]}
          onPress={handleSend}
          disabled={!newMessage.trim() || isPending || disabled}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      )}
    </View>
  );
};

export default MessageInput;
