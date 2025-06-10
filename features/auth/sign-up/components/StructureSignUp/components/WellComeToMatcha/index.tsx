import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Button } from '@/components/ui/Button/matcha-button';
import { UploadProgress } from '@/features/profile/components';
import { authActions } from '@/store/global/auth';
import { getAuthUser } from '@/store/global/auth/auth.slice';
import { random } from 'lodash';
import { showErrorToast } from '@/helpers/toast.helper';
import { styles } from './styles';
import { useRouter } from 'expo-router';
import { useUpdateProfileMutation } from '@/rtk-query';

interface WellComeToMatchaProps {}

const termsAndConditions = [
  {
    title: 'General Introduction',
    description:
      'By registering and using the Matcha application, you agree to comply with all the terms and policies outlined below. These terms are designed to ensure a safe, respectful, and positive environment for all users.',
  },
  {
    title: 'Eligibility',
    description:
      'You must be 18 years of age or older to use Matcha.\n\nYou agree to provide accurate and truthful personal information when creating your profile.\n\nImpersonating others or using fake identities is strictly prohibited.',
  },
  {
    title: 'Prohibited Behavior',
    description:
      'Users must not engage in the following behaviors:\n\nHarassing, threatening, or disturbing others in any form.\n\nSending or sharing sexually explicit, sensitive, violent, or discriminatory content.\n\nImpersonating others or creating fake profiles.\n\nUsing the platform to scam, solicit, or request money or assets.\n\nSharing malicious links, viruses, or harmful software.',
  },
  {
    title: 'User Rights and Responsibilities',
    description:
      "User Rights:\n + Create and manage a personal profile.\n + Search for and connect with compatible users.\n + Report inappropriate or harmful behavior.\n\nUser Responsibilities:\n + Respect the privacy and boundaries of others.\n + Do not share or misuse others' personal information or images.\n + Do not use the platform for commercial purposes without permission.",
  },
  {
    title: 'User Reporting Policy',
    subSections: [
      {
        subtitle: 'Purpose',
        numbering: '5.1',
        description:
          'The user reporting feature exists to help keep Matcha a safe and respectful environment for everyone.',
      },
      {
        subtitle: 'Reportable Behaviors',
        numbering: '5.2',
        description:
          'You may report users for the following actions:\n\nUsing abusive, inappropriate, or harassing language.\n\nSending explicit, offensive, or sexually suggestive content.\n\nScamming, soliciting money or valuables.\n\nImpersonation or fake profiles.\n\nDiscrimination or hate speech.',
      },
      {
        subtitle: 'Handling Procedure',
        numbering: '5.3',
        description:
          'Reception: Reports are automatically logged in our system.\n\nReview: Our moderation team will verify related evidence (messages, profile content, etc.).\n\nActions:\n - Issue a warning, temporarily suspend, or permanently ban accounts based on severity.\n - Users may appeal the decision within 7 days if they believe it is unjust.',
      },
      {
        subtitle: 'Reporter Confidentiality',
        numbering: '5.4',
        description:
          'All reporter information will be kept strictly confidential.\n\nFalse reporting with malicious intent may lead to account review or disciplinary action.',
      },
    ],
  },
  {
    title: 'Privacy and Data Protection',
    description:
      'Matcha is committed to protecting your data in accordance with our Privacy Policy.\n\nYour data is encrypted and will not be shared with third parties without consent.\n\nYou may request to modify or delete your account and data at any time.',
  },
  {
    title: 'Termination of Use',
    description:
      'You may delete your account at any time through the app settings.\n\nMatcha reserves the right to suspend or terminate accounts without prior notice if violations are detected.',
  },
  {
    title: 'Governing Law and Dispute Resolution',
    description:
      'These terms are governed by the laws of Vietnam.\n\nAll disputes will be resolved via negotiation before escalating to legal authorities.',
  },
  {
    title: 'Changes to Terms',
    description:
      'Matcha may update these terms and conditions at any time. Users will be notified and are encouraged to check periodically for updates.\n\nBy continuing to use the Matcha application, you confirm that you have read, understood, and agreed to all of the above terms and conditions.',
  },
];

export const WellComeToMatcha = ({}: WellComeToMatchaProps) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const userAuth = useSelector(getAuthUser);
  const [isUploading, setIsUploading] = useState(false);
  const [isTermsAccepted, setIsTermsAccepted] = useState(false);
  const [updateProfile, { isLoading: isLoadingUpdateProfile }] =
    useUpdateProfileMutation();

  const handleContinue = async () => {
    try {
      setIsUploading(true);
      const response = await updateProfile({
        is_verified: true,
      });

      if ('error' in response) {
        showErrorToast(response.error);
        return;
      }
      dispatch(
        authActions.setAuthProfile({
          user: {
            ...userAuth,
            is_verified: true,
          },
        } as any)
      );
      router.push('/(tabs)');
    } catch (error) {
      showErrorToast(error);
    } finally {
      setIsUploading(false);
    }
  };

  const renderBulletPoint = (text: string, index: number) => {
    return (
      <View style={styles.ruleDescription} key={random(100)}>
        <View style={styles.bulletPoint} />
        <Text style={styles.bulletText}>{text}</Text>
      </View>
    );
  };

  const renderDescription = (description: string, index: number) => {
    if (!description || description.trim() === '') return null;

    // Special handling for \n + pattern which indicates a list with + markers
    if (description.includes('\n +')) {
      const sections = description.split('\n\n');

      return sections.map((section, sectionIndex) => {
        if (section.includes('\n +')) {
          // This is a section with a list
          const [header, ...items] = section.split('\n +');

          return (
            <View key={random(100)}>
              {header && <Text style={styles.bulletText}>{header.trim()}</Text>}
              {items.map((item, itemIndex) => (
                <View
                  key={random(100)}
                  style={[styles.ruleDescription, { marginTop: 8 }]}
                >
                  <View style={styles.bulletPoint} />
                  <Text style={styles.bulletText}>{item.trim()}</Text>
                </View>
              ))}
            </View>
          );
        } else {
          // Standard paragraph
          return renderBulletPoint(section, index);
        }
      });
    }

    // Standard paragraphs
    const paragraphs = description.split('\n\n').filter((p) => p.trim() !== '');
    if (paragraphs.length === 0) return null;

    return paragraphs.map((paragraph, i) => renderBulletPoint(paragraph, i));
  };

  const renderSection = (section: any, index: number) => {
    // Standard section rendering
    if (!section.subSections) {
      return (
        <View key={random(100)} style={styles.ruleItem}>
          <View style={styles.numberContainer}>
            <Text style={styles.numberText}>{index + 1}.</Text>
          </View>
          <View key={random(100)} style={styles.ruleContent}>
            <Text style={styles.ruleTitle}>{section.title}</Text>
            {section.description && renderDescription(section.description, index)}
          </View>
        </View>
      );
    }

    // Section with subsections (special rendering for section 5)
    return (
      <View key={random(100)}>
        <View style={styles.ruleItem}>
          <View style={styles.numberContainer}>
            <Text style={styles.numberText}>{index + 1}.</Text>
          </View>
          <View style={styles.ruleContent}>
            <Text style={styles.ruleTitle}>{section.title}</Text>
          </View>
        </View>

        {section.subSections.map((subSection: any, subIndex: number) => (
          <View key={random(100)}>
            <View style={styles.subSectionRow}>
              <View style={styles.subSectionNumber}>
                <Text style={styles.subSectionNumberText}>
                  {subSection.numbering}
                </Text>
              </View>
              <View style={styles.subSectionContent}>
                <Text style={styles.subSectionTitle}>
                  {subSection.subtitle}
                </Text>
                {subSection.description &&
                  renderDescription(subSection.description, subIndex)}
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Image style={styles.logo} source={require('@/assets/images/logo.png')} />
      <Text style={styles.title}>TERMS AND CONDITIONS</Text>
      <Text style={styles.title}>OF USE</Text>
      <Text style={styles.subtitle}>Matcha Online Dating Application</Text>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.rulesContainer}>
          {termsAndConditions.map((section, index) => (
            <View key={random(100)}>
              {index > 0 && <View style={styles.sectionSeparator} />}
              {renderSection(section, index)}
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.agreeButtonContainer}>
        <TouchableOpacity
          style={styles.checkboxContainer}
          onPress={() => setIsTermsAccepted(!isTermsAccepted)}
          activeOpacity={0.7}
        >
          <View
            style={[styles.checkbox, isTermsAccepted && styles.checkboxChecked]}
          >
            {isTermsAccepted && <Text style={styles.checkmark}>✓</Text>}
          </View>
          <Text style={styles.checkboxText}>
            I accept these terms and conditions
          </Text>
        </TouchableOpacity>

        <Button
          text="I AGREE"
          onPress={handleContinue}
          isDisable={isLoadingUpdateProfile || !isTermsAccepted}
        />
      </View>

      <UploadProgress visible={isUploading || isLoadingUpdateProfile} />
    </View>
  );
};
