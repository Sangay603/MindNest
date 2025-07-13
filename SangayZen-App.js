/*
SangayZen - Mental Health & Productivity App
Complete React Native app with Expo for mental health tracking, AI journaling, meditation, and focus timer.

To use:
1. Create new Expo project: npx create-expo-app MentalHealthApp
2. Replace App.js with this code
3. Install: npm install @react-navigation/native @react-navigation/bottom-tabs react-native-screens react-native-safe-area-context expo-linear-gradient expo-av
4. Run: npx expo start --web

Features: Mood tracking, AI journaling, meditation, Pomodoro timer
*/

import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Animated, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Mock Firebase functions
const saveMood = async (mood, timestamp) => console.log('Saving mood:', mood);
const saveJournalEntry = async (entry) => console.log('Saving journal:', entry);
const saveTimerSession = async (session) => console.log('Saving session:', session);

// AI Service
const aiService = {
  generatePrompt: (entry) => {
    const keywords = entry.toLowerCase();
    if (keywords.includes('stress') || keywords.includes('anxiety')) {
      return "I notice you're feeling stressed. Remember to take deep breaths and practice self-compassion.";
    } else if (keywords.includes('sad') || keywords.includes('depressed')) {
      return "It's okay to feel sad. Your feelings are valid. Consider reaching out to someone you trust.";
    } else if (keywords.includes('happy') || keywords.includes('excited')) {
      return "I'm glad you're feeling positive! What contributed to this feeling?";
    } else {
      return "Thank you for sharing. How are you really feeling today?";
    }
  },
  chatResponse: (message) => {
    const msg = message.toLowerCase();
    if (msg.includes('hello') || msg.includes('hi')) {
      return "Hello! I'm here to support your mental health journey. How are you feeling today?";
    } else if (msg.includes('help') || msg.includes('support')) {
      return "I'm here to listen and support you. You can share your thoughts, feelings, or concerns.";
    } else if (msg.includes('meditation') || msg.includes('breathing')) {
      return "Great idea! Try taking 3 deep breaths: inhale for 4 counts, hold for 4, exhale for 4.";
    } else {
      return "Thank you for sharing. I'm here to listen and support you. What's on your mind?";
    }
  }
};

// Mood Tracker Component
const MoodTracker = () => {
  const [selectedMood, setSelectedMood] = useState(null);
  const [moodHistory, setMoodHistory] = useState([]);
  const [note, setNote] = useState('');

  const moods = [
    { emoji: '😊', label: 'Happy', color: '#4CAF50' },
    { emoji: '😌', label: 'Calm', color: '#2196F3' },
    { emoji: '😐', label: 'Neutral', color: '#9E9E9E' },
    { emoji: '😔', label: 'Sad', color: '#607D8B' },
    { emoji: '😰', label: 'Anxious', color: '#FF9800' },
    { emoji: '😡', label: 'Angry', color: '#F44336' },
    { emoji: '😴', label: 'Tired', color: '#795548' },
    { emoji: '🤗', label: 'Grateful', color: '#E91E63' }
  ];

  const saveMoodEntry = async () => {
    if (!selectedMood) {
      Alert.alert('Please select a mood');
      return;
    }

    const entry = {
      mood: selectedMood,
      note: note,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString()
    };

    await saveMood(entry.mood, entry.timestamp);
    setMoodHistory([entry, ...moodHistory]);
    setSelectedMood(null);
    setNote('');
    Alert.alert('Mood saved!', 'Your mood has been recorded successfully.');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>How are you feeling today?</Text>
        <Text style={styles.subtitle}>Track your daily mood and mental health</Text>
      </View>

      <View style={styles.moodGrid}>
        {moods.map((mood, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.moodButton, selectedMood?.label === mood.label && styles.selectedMood]}
            onPress={() => setSelectedMood(mood)}
          >
            <Text style={styles.moodEmoji}>{mood.emoji}</Text>
            <Text style={styles.moodLabel}>{mood.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {selectedMood && (
        <View style={styles.noteSection}>
          <Text style={styles.noteLabel}>Add a note (optional):</Text>
          <TextInput
            style={styles.noteInput}
            placeholder="How are you feeling? What's on your mind?"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
          />
          <TouchableOpacity style={styles.saveButton} onPress={saveMoodEntry}>
            <Text style={styles.saveButtonText}>Save Mood</Text>
          </TouchableOpacity>
        </View>
      )}

      {moodHistory.length > 0 && (
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Recent Moods</Text>
          {moodHistory.slice(0, 5).map((entry, index) => (
            <View key={index} style={styles.historyItem}>
              <Text style={styles.historyEmoji}>{entry.mood.emoji}</Text>
              <View style={styles.historyDetails}>
                <Text style={styles.historyMood}>{entry.mood.label}</Text>
                <Text style={styles.historyDate}>{entry.date}</Text>
                {entry.note && <Text style={styles.historyNote}>{entry.note}</Text>}
              </View>
            </View>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

// Journal Component
const Journal = () => {
  const [activeTab, setActiveTab] = useState('journal');
  const [journalEntry, setJournalEntry] = useState('');
  const [journalHistory, setJournalHistory] = useState([]);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, text: "Hello! I'm here to support your mental health journey. How are you feeling today?", isAI: true }
  ]);
  const [chatInput, setChatInput] = useState('');

  const saveJournalEntry = async () => {
    if (!journalEntry.trim()) {
      Alert.alert('Please write something before saving');
      return;
    }

    const entry = {
      id: Date.now(),
      text: journalEntry,
      timestamp: new Date().toISOString(),
      date: new Date().toLocaleDateString(),
      aiPrompt: aiService.generatePrompt(journalEntry)
    };

    await saveJournalEntry(entry);
    setJournalHistory([entry, ...journalHistory]);
    setJournalEntry('');
    Alert.alert('Entry saved!', 'Your journal entry has been saved successfully.');
  };

  const sendChatMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage = { id: Date.now(), text: chatInput, isAI: false };
    setChatMessages(prev => [...prev, userMessage]);
    setChatInput('');

    setTimeout(() => {
      const aiResponse = aiService.chatResponse(chatInput);
      const aiMessage = { id: Date.now() + 1, text: aiResponse, isAI: true };
      setChatMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <View style={styles.container}>
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'journal' && styles.activeTab]}
          onPress={() => setActiveTab('journal')}
        >
          <Text style={[styles.tabText, activeTab === 'journal' && styles.activeTabText]}>Journal</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
          onPress={() => setActiveTab('chat')}
        >
          <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>AI Chat</Text>
        </TouchableOpacity>
      </View>

      {activeTab === 'journal' ? (
        <ScrollView style={styles.journalContainer}>
          <View style={styles.journalSection}>
            <Text style={styles.sectionTitle}>Write your thoughts</Text>
            <TextInput
              style={styles.journalInput}
              placeholder="How are you feeling? What's on your mind? Write freely..."
              value={journalEntry}
              onChangeText={setJournalEntry}
              multiline
              numberOfLines={8}
            />
            <TouchableOpacity style={styles.saveButton} onPress={saveJournalEntry}>
              <Text style={styles.saveButtonText}>Save Entry</Text>
            </TouchableOpacity>
          </View>

          {journalHistory.length > 0 && (
            <View style={styles.historySection}>
              <Text style={styles.sectionTitle}>Recent Entries</Text>
              {journalHistory.map((entry) => (
                <View key={entry.id} style={styles.journalItem}>
                  <Text style={styles.journalDate}>{entry.date}</Text>
                  <Text style={styles.journalText}>{entry.text}</Text>
                  {entry.aiPrompt && (
                    <View style={styles.aiPrompt}>
                      <Text style={styles.aiPromptText}>💡 {entry.aiPrompt}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}
        </ScrollView>
      ) : (
        <View style={styles.chatContainer}>
          <ScrollView style={styles.chatMessages}>
            {chatMessages.map((message) => (
              <View
                key={message.id}
                style={[styles.messageContainer, message.isAI ? styles.aiMessage : styles.userMessage]}
              >
                <Text style={[styles.messageText, message.isAI ? styles.aiMessageText : styles.userMessageText]}>
                  {message.text}
                </Text>
              </View>
            ))}
          </ScrollView>
          <View style={styles.chatInputContainer}>
            <TextInput
              style={styles.chatInput}
              placeholder="Type your message..."
              value={chatInput}
              onChangeText={setChatInput}
              multiline
            />
            <TouchableOpacity style={styles.sendButton} onPress={sendChatMessage}>
              <Ionicons name="send" size={20} color="white" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );
};

// Meditation Component
const Meditation = () => {
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState('inhale');
  const [breathAnimation] = useState(new Animated.Value(1));

  const startBreathing = () => {
    setIsBreathing(true);
    breathCycle();
  };

  const stopBreathing = () => {
    setIsBreathing(false);
    setBreathPhase('inhale');
    breathAnimation.setValue(1);
  };

  const breathCycle = () => {
    if (!isBreathing) return;

    setBreathPhase('inhale');
    Animated.timing(breathAnimation, {
      toValue: 1.5,
      duration: 4000,
      useNativeDriver: true,
    }).start(() => {
      setBreathPhase('hold');
      setTimeout(() => {
        if (isBreathing) {
          setBreathPhase('exhale');
          Animated.timing(breathAnimation, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: true,
          }).start(() => {
            if (isBreathing) breathCycle();
          });
        }
      }, 2000);
    });
  };

  const getPhaseColor = () => {
    switch (breathPhase) {
      case 'inhale': return '#4CAF50';
      case 'hold': return '#FF9800';
      case 'exhale': return '#2196F3';
      default: return '#4CAF50';
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meditation & Breathwork</Text>
        <Text style={styles.subtitle}>Find peace through guided breathing</Text>
      </View>

      <View style={styles.breathingSection}>
        <Text style={styles.sectionTitle}>Guided Breathing</Text>
        <View style={styles.breathingCircle}>
          <Animated.View
            style={[styles.breathingCircleInner, {
              transform: [{ scale: breathAnimation }],
              backgroundColor: getPhaseColor(),
            }]}
          >
            <Text style={styles.breathingText}>{breathPhase.toUpperCase()}</Text>
          </Animated.View>
        </View>

        <View style={styles.breathingControls}>
          {!isBreathing ? (
            <TouchableOpacity style={styles.startButton} onPress={startBreathing}>
              <Text style={styles.startButtonText}>Start Breathing</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.stopButton} onPress={stopBreathing}>
              <Text style={styles.stopButtonText}>Stop</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.tipsSection}>
        <Text style={styles.sectionTitle}>Meditation Tips</Text>
        <View style={styles.tipItem}>
          <Text style={styles.tipTitle}>🌬️ Deep Breathing</Text>
          <Text style={styles.tipText}>Practice 4-4-4 breathing: inhale for 4 counts, hold for 4, exhale for 4.</Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipTitle}>🧘‍♀️ Body Scan</Text>
          <Text style={styles.tipText}>Focus attention on each part of your body, from toes to head.</Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipTitle}>🎯 Mindful Focus</Text>
          <Text style={styles.tipText}>Choose an object or thought and gently return to it when your mind wanders.</Text>
        </View>
      </View>
    </ScrollView>
  );
};

// Focus Timer Component
const FocusTimer = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [sessions, setSessions] = useState(0);
  const [progressAnimation] = useState(new Animated.Value(0));

  const totalTime = isBreak ? 5 * 60 : 25 * 60;

  useEffect(() => {
    let interval = null;
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0) {
      handleTimerComplete();
    }
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  useEffect(() => {
    const progress = 1 - (timeLeft / totalTime);
    Animated.timing(progressAnimation, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [timeLeft, totalTime]);

  const startTimer = () => setIsRunning(true);
  const pauseTimer = () => setIsRunning(false);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(totalTime);
    setIsBreak(false);
    progressAnimation.setValue(0);
  };

  const handleTimerComplete = () => {
    setIsRunning(false);
    if (!isBreak) {
      setSessions(sessions + 1);
      setTimeLeft(5 * 60);
      setIsBreak(true);
      Alert.alert('Work Session Complete!', 'Take a 5-minute break.');
    } else {
      setTimeLeft(25 * 60);
      setIsBreak(false);
      Alert.alert('Break Complete!', 'Ready for your next work session?');
    }
    progressAnimation.setValue(0);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Focus Timer</Text>
        <Text style={styles.subtitle}>{isBreak ? 'Take a break' : 'Stay focused and productive'}</Text>
      </View>

      <View style={styles.timerSection}>
        <View style={styles.timerDisplay}>
          <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          <Text style={styles.timerLabel}>{isBreak ? 'Break Time' : 'Focus Time'}</Text>
        </View>

        <View style={styles.progressContainer}>
          <Animated.View
            style={[styles.progressBar, {
              width: progressAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
              backgroundColor: isBreak ? '#4CAF50' : '#2196F3',
            }]}
          />
        </View>

        <View style={styles.timerControls}>
          {!isRunning ? (
            <TouchableOpacity style={styles.startButton} onPress={startTimer}>
              <Text style={styles.startButtonText}>Start</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.pauseButton} onPress={pauseTimer}>
              <Text style={styles.pauseButtonText}>Pause</Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.resetButton} onPress={resetTimer}>
            <Text style={styles.resetButtonText}>Reset</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>Your Progress</Text>
        <View style={styles.statItem}>
          <Text style={styles.statLabel}>Completed Sessions</Text>
          <Text style={styles.statValue}>{sessions}</Text>
        </View>
      </View>

      <View style={styles.tipsSection}>
        <Text style={styles.sectionTitle}>Focus Tips</Text>
        <View style={styles.tipItem}>
          <Text style={styles.tipTitle}>🎯 Clear Workspace</Text>
          <Text style={styles.tipText}>Remove distractions and organize your space before starting.</Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipTitle}>📱 Silence Notifications</Text>
          <Text style={styles.tipText}>Put your phone on silent and close unnecessary apps.</Text>
        </View>
        <View style={styles.tipItem}>
          <Text style={styles.tipTitle}>💧 Stay Hydrated</Text>
          <Text style={styles.tipText}>Keep water nearby and take small sips during breaks.</Text>
        </View>
      </View>
    </ScrollView>
  );
};

// Main App Component
const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, color, size }) => {
            let iconName;
            if (route.name === 'Mood') iconName = focused ? 'happy' : 'happy-outline';
            else if (route.name === 'Journal') iconName = focused ? 'journal' : 'journal-outline';
            else if (route.name === 'Meditate') iconName = focused ? 'leaf' : 'leaf-outline';
            else if (route.name === 'Focus') iconName = focused ? 'timer' : 'timer-outline';
            return <Ionicons name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: '#2196F3',
          tabBarInactiveTintColor: 'gray',
          headerShown: false,
          tabBarStyle: {
            backgroundColor: 'white',
            borderTopWidth: 1,
            borderTopColor: '#e0e0e0',
            paddingBottom: 5,
            paddingTop: 5,
            height: 60,
          },
        })}
      >
        <Tab.Screen name="Mood" component={MoodTracker} />
        <Tab.Screen name="Journal" component={Journal} />
        <Tab.Screen name="Meditate" component={Meditation} />
        <Tab.Screen name="Focus" component={FocusTimer} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}

// Styles
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 20, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  title: { fontSize: 24, fontWeight: 'bold', color: '#333', marginBottom: 5 },
  subtitle: { fontSize: 16, color: '#666' },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 20, justifyContent: 'space-between' },
  moodButton: { width: '48%', backgroundColor: 'white', padding: 20, borderRadius: 15, alignItems: 'center', marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  selectedMood: { backgroundColor: '#e3f2fd', borderWidth: 2, borderColor: '#2196F3' },
  moodEmoji: { fontSize: 40, marginBottom: 10 },
  moodLabel: { fontSize: 16, fontWeight: '600', color: '#333' },
  noteSection: { padding: 20, backgroundColor: 'white', margin: 20, borderRadius: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  noteLabel: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 10 },
  noteInput: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, padding: 15, fontSize: 16, minHeight: 100, textAlignVertical: 'top' },
  saveButton: { backgroundColor: '#2196F3', padding: 15, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  saveButtonText: { color: 'white', fontSize: 16, fontWeight: '600' },
  historySection: { padding: 20 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  historyItem: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: 'row', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  historyEmoji: { fontSize: 30, marginRight: 15 },
  historyDetails: { flex: 1 },
  historyMood: { fontSize: 16, fontWeight: '600', color: '#333' },
  historyDate: { fontSize: 14, color: '#666', marginTop: 2 },
  historyNote: { fontSize: 14, color: '#666', marginTop: 5, fontStyle: 'italic' },
  tabContainer: { flexDirection: 'row', backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#e0e0e0' },
  tab: { flex: 1, paddingVertical: 15, alignItems: 'center' },
  activeTab: { borderBottomWidth: 2, borderBottomColor: '#2196F3' },
  tabText: { fontSize: 16, color: '#666' },
  activeTabText: { color: '#2196F3', fontWeight: '600' },
  journalContainer: { flex: 1 },
  journalSection: { padding: 20 },
  journalInput: { borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 10, padding: 15, fontSize: 16, minHeight: 150, textAlignVertical: 'top', backgroundColor: 'white' },
  journalItem: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  journalDate: { fontSize: 14, color: '#666', marginBottom: 5 },
  journalText: { fontSize: 16, color: '#333', lineHeight: 24 },
  aiPrompt: { backgroundColor: '#e8f5e8', padding: 10, borderRadius: 8, marginTop: 10 },
  aiPromptText: { fontSize: 14, color: '#2e7d32', fontStyle: 'italic' },
  chatContainer: { flex: 1 },
  chatMessages: { flex: 1, padding: 20 },
  messageContainer: { marginBottom: 15, maxWidth: '80%' },
  userMessage: { alignSelf: 'flex-end', backgroundColor: '#2196F3', padding: 12, borderRadius: 15, borderBottomRightRadius: 5 },
  aiMessage: { alignSelf: 'flex-start', backgroundColor: '#f0f0f0', padding: 12, borderRadius: 15, borderBottomLeftRadius: 5 },
  messageText: { fontSize: 16 },
  userMessageText: { color: 'white' },
  aiMessageText: { color: '#333' },
  chatInputContainer: { flexDirection: 'row', padding: 20, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#e0e0e0' },
  chatInput: { flex: 1, borderWidth: 1, borderColor: '#e0e0e0', borderRadius: 20, paddingHorizontal: 15, paddingVertical: 10, fontSize: 16, maxHeight: 100 },
  sendButton: { backgroundColor: '#2196F3', width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginLeft: 10 },
  breathingSection: { padding: 20, alignItems: 'center' },
  breathingCircle: { width: 200, height: 200, borderRadius: 100, backgroundColor: '#f0f0f0', justifyContent: 'center', alignItems: 'center', marginVertical: 30 },
  breathingCircleInner: { width: 150, height: 150, borderRadius: 75, justifyContent: 'center', alignItems: 'center' },
  breathingText: { fontSize: 24, fontWeight: 'bold', color: 'white' },
  breathingControls: { marginTop: 20 },
  startButton: { backgroundColor: '#4CAF50', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 25 },
  startButtonText: { color: 'white', fontSize: 18, fontWeight: '600' },
  stopButton: { backgroundColor: '#f44336', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 25 },
  stopButtonText: { color: 'white', fontSize: 18, fontWeight: '600' },
  tipsSection: { padding: 20 },
  tipItem: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  tipTitle: { fontSize: 16, fontWeight: '600', color: '#333', marginBottom: 5 },
  tipText: { fontSize: 14, color: '#666', lineHeight: 20 },
  timerSection: { padding: 20, alignItems: 'center' },
  timerDisplay: { alignItems: 'center', marginBottom: 30 },
  timerText: { fontSize: 48, fontWeight: 'bold', color: '#333' },
  timerLabel: { fontSize: 18, color: '#666', marginTop: 5 },
  progressContainer: { width: '100%', height: 10, backgroundColor: '#e0e0e0', borderRadius: 5, marginBottom: 30, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 5 },
  timerControls: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  pauseButton: { backgroundColor: '#ff9800', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 25, marginRight: 15 },
  pauseButtonText: { color: 'white', fontSize: 18, fontWeight: '600' },
  resetButton: { backgroundColor: '#666', paddingHorizontal: 30, paddingVertical: 15, borderRadius: 25 },
  resetButtonText: { color: 'white', fontSize: 18, fontWeight: '600' },
  statsSection: { padding: 20 },
  statItem: { backgroundColor: 'white', padding: 15, borderRadius: 10, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, elevation: 2 },
  statLabel: { fontSize: 16, color: '#666' },
  statValue: { fontSize: 18, fontWeight: 'bold', color: '#2196F3' },
}); 