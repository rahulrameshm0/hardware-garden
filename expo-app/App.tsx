import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  AppState,
  BackHandler,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  useAudioPlayer,
  useAudioPlayerStatus,
  setAudioModeAsync,
} from "expo-audio";
import { File, Paths } from "expo-file-system";
import * as Speech from "expo-speech";
import * as Crypto from "expo-crypto";
import * as WebBrowser from "expo-web-browser";
import Constants from "expo-constants";
import { WebView } from "react-native-webview";
import {
  lessons,
  modules,
  glossary,
  modelNames,
  type Lesson,
  type ModelId,
} from "./src/course";
import {
  emptyProgress,
  mergeProgress,
  type ProgressMap,
  type Progress,
} from "./src/progress";
import { chapterStories } from "./src/chapter-stories";
import { sectionVideo, youtubeUrl } from "./src/lesson-videos";
import { courseExplanation, type Explanation } from "./src/assistant";
import {
  API,
  WEB,
  api,
  jsonApi,
  restoreToken,
  clearToken,
  saveOAuthProof,
  finishOAuth,
} from "./src/api";
WebBrowser.maybeCompleteAuthSession();
type User = { id: string; name: string };
type Prefs = {
  theme: "dark" | "light" | "system";
  large: boolean;
  reduce: boolean;
  voice: "natural" | "device";
  speed: number;
};
const defaults: Prefs = {
  theme: "dark",
  large: false,
  reduce: false,
  voice: "natural",
  speed: 1,
};
const dark = {
  bg: "#101820",
  paper: "#1b2632",
  ink: "#eef3f7",
  muted: "#a2b4c8",
  line: "#31404d",
  accent: "#9fdfb0",
  tint: "#234b3d",
  button: "#b5ebc3",
};
const light = {
  bg: "#f4f6f0",
  paper: "#ffffff",
  ink: "#213c36",
  muted: "#63766f",
  line: "#d9e3da",
  accent: "#266e4a",
  tint: "#e5f1df",
  button: "#b5ebc3",
};
type Palette = typeof dark;
const Context = React.createContext({ c: dark, prefs: defaults });
function T({
  children,
  muted = false,
  size = 16,
  bold = false,
}: {
  children: React.ReactNode;
  muted?: boolean;
  size?: number;
  bold?: boolean;
}) {
  const { c, prefs } = React.useContext(Context);
  return (
    <Text
      selectable
      style={{
        color: muted ? c.muted : c.ink,
        fontSize: size + (prefs.large && size >= 15 ? 2 : 0),
        lineHeight: size * 1.55,
        fontWeight: bold ? "700" : "400",
      }}
    >
      {children}
    </Text>
  );
}
function Button({
  title,
  onPress,
  secondary = false,
  disabled = false,
  icon,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  disabled?: boolean;
  icon?: React.ComponentProps<typeof Ionicons>["name"];
}) {
  const { c } = React.useContext(Context);
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => ({
        paddingVertical: 13,
        paddingHorizontal: 17,
        minHeight: 48,
        borderRadius: 13,
        backgroundColor: secondary ? c.paper : c.button,
        borderColor: secondary ? c.line : c.button,
        borderWidth: 1,
        opacity: disabled ? 0.4 : pressed ? 0.7 : 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
      })}
    >
      {icon && (
        <Ionicons name={icon} color={secondary ? c.ink : "#153929"} size={19} />
      )}
      <Text
        style={{
          color: secondary ? c.ink : "#153929",
          fontSize: 14,
          fontWeight: "700",
          textAlign: "center",
        }}
      >
        {title}
      </Text>
    </Pressable>
  );
}
function Card({ children }: { children: React.ReactNode }) {
  const { c } = React.useContext(Context);
  return (
    <View
      style={{
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: c.line,
        backgroundColor: c.paper,
        gap: 13,
      }}
    >
      {children}
    </View>
  );
}
function Field({
  value,
  onChange,
  placeholder,
  secure = false,
}: {
  value: string;
  onChange: (s: string) => void;
  placeholder: string;
  secure?: boolean;
}) {
  const { c } = React.useContext(Context);
  return (
    <TextInput
      accessibilityLabel={placeholder}
      autoCapitalize="none"
      autoCorrect={false}
      secureTextEntry={secure}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor={c.muted}
      style={{
        backgroundColor: c.paper,
        borderColor: c.line,
        borderWidth: 1,
        borderRadius: 12,
        padding: 15,
        fontSize: 16,
        minHeight: 50,
        color: c.ink,
      }}
    />
  );
}
function NativeApp() {
  const system = useColorScheme();
  const [prefs, setPrefs] = useState(defaults),
    [tab, setTab] = useState("Home"),
    [selected, setSelected] = useState<Lesson | null>(null),
    [user, setUser] = useState<User | null>(null),
    [progress, setProgress] = useState<ProgressMap>({}),
    [ready, setReady] = useState(false),
    [syncText, setSyncText] = useState("Loading your space…"),
    [notice, setNotice] = useState(""),
    [authOpen, setAuthOpen] = useState(false),
    [model, setModel] = useState<ModelId | null>(null),
    [search, setSearch] = useState("");
  const owner = useRef<User | null>(null),
    current = useRef<ProgressMap>({}),
    generation = useRef(0),
    activeAudio = useRef<File | null>(null),
    voiceRun = useRef(0),
    ended = useRef<(() => void) | undefined>(undefined);
  const [voiceState, setVoiceState] = useState(""),
    [voiceError, setVoiceError] = useState("");
  const player = useAudioPlayer(null),
    audioStatus = useAudioPlayerStatus(player);
  const c =
    prefs.theme === "system"
      ? system === "light"
        ? light
        : dark
      : prefs.theme === "light"
        ? light
        : dark;
  async function stopVoice() {
    voiceRun.current++;
    ended.current = undefined;
    try {
      player.pause();
    } catch {}
    await Speech.stop().catch(() => {});
    setVoiceState("");
  }
  async function speak(text: string, onEnd?: () => void) {
    const run = voiceRun.current + 1;
    await stopVoice();
    if (run !== voiceRun.current) return;
    setVoiceError("");
    ended.current = onEnd;
    try {
      await setAudioModeAsync({
        playsInSilentMode: true,
        allowsRecording: false,
        shouldPlayInBackground: false,
      });
      if (prefs.voice === "device") {
        const voices = await Speech.getAvailableVoicesAsync();
        const best = voices
          .filter((v) => v.language.startsWith("en"))
          .sort(
            (a, b) =>
              (/enhanced|natural|premium|neural/i.test(b.name) ? 1 : 0) -
              (/enhanced|natural|premium|neural/i.test(a.name) ? 1 : 0),
          )[0];
        if (run !== voiceRun.current) return;
        setVoiceState("Speaking · device voice");
        Speech.speak(text, {
          language: "en-US",
          voice: best?.identifier,
          rate: 0.95 * prefs.speed,
          onDone: () => {
            if (run === voiceRun.current) {
              setVoiceState("");
              ended.current?.();
              ended.current = undefined;
            }
          },
          onError: () => {
            setVoiceError(
              "Device voice is unavailable. On iPhone, turn off silent mode or use natural voice.",
            );
            setVoiceState("");
          },
        });
        return;
      }
      if (!owner.current)
        throw Error(
          "Sign in to hear natural Gemini narration, or choose Device voice in Settings.",
        );
      setVoiceState("Preparing natural voice…");
      const r = await api("/api/assistant/voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: text.slice(0, 2200) }),
      });
      if (!r.ok)
        throw Error(
          r.status === 429
            ? "The hourly AI voice limit is reached. Device voice is available in Settings."
            : "Natural voice could not load. Retry, or choose Device voice in Settings.",
        );
      const bytes = new Uint8Array(await r.arrayBuffer());
      if (run !== voiceRun.current) return;
      const file = new File(Paths.cache, `hg-narration-${Date.now()}.wav`);
      file.write(bytes);
      try {
        activeAudio.current?.delete();
      } catch {}
      activeAudio.current = file;
      player.replace(file.uri);
      player.setPlaybackRate(prefs.speed);
      setVoiceState("Speaking · natural AI voice");
      player.play();
    } catch (e) {
      if (run === voiceRun.current) {
        setVoiceState("");
        setVoiceError(
          e instanceof Error
            ? e.message
            : "Audio could not play. Please try again.",
        );
      }
    }
  }
  useEffect(() => {
    if (audioStatus.didJustFinish) {
      setVoiceState("");
      const done = ended.current;
      ended.current = undefined;
      done?.();
    }
  }, [audioStatus.didJustFinish]);
  useEffect(
    () => () => {
      voiceRun.current++;
      try {
        player.pause();
      } catch {}
      void Speech.stop().catch(() => {});
      try {
        activeAudio.current?.delete();
      } catch {}
    },
    [],
  );
  async function useAccount(next: User | null) {
    generation.current++;
    owner.current = next;
    setUser(next);
    const key = "hg-native-progress-" + (next?.id || "guest");
    let local: ProgressMap = {};
    try {
      local = JSON.parse((await AsyncStorage.getItem(key)) || "{}");
    } catch {}
    current.current = local;
    setProgress(local);
    await AsyncStorage.setItem("hg-native-account", JSON.stringify(next));
    setReady(true);
    if (next) void sync(local, next);
    else setSyncText("Saved on this device");
  }
  async function sync(snapshot = current.current, account = owner.current) {
    if (!account) {
      setSyncText("Saved on this device");
      return;
    }
    const g = generation.current;
    setSyncText("Syncing…");
    try {
      const result = await jsonApi("/api/progress", snapshot, {
        "x-learning-account": account.id,
      });
      if (g !== generation.current) return;
      const merged = mergeProgress(current.current, result);
      current.current = merged;
      setProgress((previous) =>
        JSON.stringify(previous) === JSON.stringify(merged) ? previous : merged,
      );
      await AsyncStorage.setItem(
        "hg-native-progress-" + account.id,
        JSON.stringify(merged),
      );
      setSyncText("All progress saved");
    } catch {
      if (g === generation.current)
        setSyncText("Offline · changes kept for next sync");
    }
  }
  useEffect(() => {
    void (async () => {
      try {
        const p = await AsyncStorage.getItem("hg-native-preferences");
        if (p) setPrefs({ ...defaults, ...JSON.parse(p) });
        await restoreToken();
        try {
          await useAccount(await jsonApi("/api/session"));
        } catch {
          const saved = JSON.parse(
            (await AsyncStorage.getItem("hg-native-account")) || "null",
          );
          await useAccount(saved);
        }
      } catch {
        await useAccount(null);
      }
    })();
    const listener = AppState.addEventListener("change", (state) => {
      if (state === "active") void sync();
      else void stopVoice();
    });
    return () => listener.remove();
  }, []);
  useEffect(() => {
    const receive = async (raw: string) => {
      try {
        if (await finishOAuth(raw)) {
          await useAccount(await jsonApi("/api/session"));
          setAuthOpen(false);
        }
      } catch (e) {
        setNotice(
          e instanceof Error ? e.message : "Sign-in expired. Please try again.",
        );
      }
    };
    void Linking.getInitialURL().then((url) => {
      if (url) void receive(url);
    });
    const sub = Linking.addEventListener("url", (e) => void receive(e.url));
    return () => sub.remove();
  }, []);
  function update(id: string, patch: Partial<Progress>) {
    const next = {
      ...current.current,
      [id]: { ...(current.current[id] || emptyProgress), ...patch },
    };
    current.current = next;
    setProgress(next);
    void AsyncStorage.setItem(
      "hg-native-progress-" + (owner.current?.id || "guest"),
      JSON.stringify(next),
    );
    setSyncText(
      owner.current ? "Changes waiting to sync" : "Saved on this device",
    );
  }
  useEffect(() => {
    if (!ready || !user) return;
    const t = setTimeout(() => void sync(), 1800);
    return () => clearTimeout(t);
  }, [progress, ready, user?.id]);
  function preference(patch: Partial<Prefs>) {
    const value = { ...prefs, ...patch };
    setPrefs(value);
    void AsyncStorage.setItem("hg-native-preferences", JSON.stringify(value));
    void stopVoice();
  }
  function open(l: Lesson) {
    void stopVoice();
    setSelected(l);
    setTab("Learn");
    setNotice("");
  }
  useEffect(() => {
    const sub = BackHandler.addEventListener("hardwareBackPress", () => {
      if (selected) {
        void stopVoice();
        setSelected(null);
        return true;
      }
      if (tab !== "Home") {
        setTab("Home");
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [selected, tab]);
  const completed = lessons.filter((l) => progress[l.id]?.completed).length;
  const resume =
    lessons.find(
      (l) =>
        l.id ===
          Object.entries(progress).sort(
            (a, b) => b[1].positionAt - a[1].positionAt,
          )[0]?.[0] && !progress[l.id]?.completed,
    ) ||
    lessons.find((l) => !progress[l.id]?.completed) ||
    lessons[0];
  const nav = [
    ["Home", "home-outline"],
    ["Learn", "book-outline"],
    ["Ask AI", "sparkles-outline"],
    ["3D Lab", "cube-outline"],
    ["Settings", "settings-outline"],
  ] as const;
  const list = lessons.filter(
    (l) =>
      !search ||
      `${l.title} ${l.description} ${l.terms.join(" ")}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  const audioControls = (
    <>
      {!!voiceState && (
        <View
          style={{
            gap: 10,
            padding: 14,
            backgroundColor: c.tint,
            borderRadius: 13,
          }}
        >
          <T size={13}>{voiceState}</T>
          <Button
            title="Stop voice"
            secondary
            onPress={() => void stopVoice()}
            icon="stop"
          />
        </View>
      )}
      {!!voiceError && (
        <View accessibilityLiveRegion="polite">
          <T size={13}>{voiceError}</T>
        </View>
      )}
    </>
  );
  return (
    <Context.Provider value={{ c, prefs }}>
      <SafeAreaView
        style={{ flex: 1, backgroundColor: c.bg }}
        edges={["top", "left", "right"]}
      >
        <StatusBar style={c === dark ? "light" : "dark"} />
        <View
          style={{
            paddingHorizontal: 20,
            paddingVertical: 13,
            borderBottomWidth: 1,
            borderColor: c.line,
            flexDirection: "row",
            alignItems: "center",
            gap: 12,
          }}
        >
          {selected && (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Back to course"
              onPress={() => {
                void stopVoice();
                setSelected(null);
              }}
              style={{ padding: 8 }}
            >
              <Ionicons name="chevron-back" size={24} color={c.ink} />
            </Pressable>
          )}
          <View style={{ flex: 1 }}>
            <T size={12} muted>
              HARDWARE GARDEN
            </T>
            <T size={19} bold>
              {selected ? "Your lesson" : tab}
            </T>
          </View>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Account"
            onPress={() => setAuthOpen(true)}
            style={{ padding: 10, backgroundColor: c.tint, borderRadius: 24 }}
          >
            <Ionicons name="person-outline" size={20} color={c.accent} />
          </Pressable>
        </View>
        {!ready ? (
          <View style={{ flex: 1, justifyContent: "center" }}>
            <ActivityIndicator color={c.accent} />
          </View>
        ) : (
          <ScrollView
            key={selected?.id || tab}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{ padding: 20, paddingBottom: 35, gap: 20 }}
          >
            {!!notice && <T size={14}>{notice}</T>}
            {selected ? (
              <LessonScreen
                key={selected.id}
                lesson={selected}
                state={progress[selected.id] || emptyProgress}
                update={(p) => update(selected.id, p)}
                speak={speak}
                stop={stopVoice}
                voiceState={voiceState}
                audioControls={audioControls}
                model={() => setModel(selected.model)}
              />
            ) : (
              <>
                {tab === "Home" && (
                  <>
                    <T muted>Hello, {user?.name || "curious learner"} ✦</T>
                    <View
                      style={{
                        padding: 25,
                        backgroundColor: c.tint,
                        borderRadius: 25,
                        gap: 17,
                      }}
                    >
                      <T size={34} bold>
                        Big ideas.{`\n`}Small steps.
                      </T>
                      <T>
                        A friendly place to understand what is inside your
                        computer.
                      </T>
                      <Button
                        title="Continue learning"
                        icon="arrow-forward"
                        onPress={() => open(resume)}
                      />
                    </View>
                    <View style={{ flexDirection: "row", gap: 12 }}>
                      <View style={{ flex: 1 }}>
                        <Card>
                          <T size={28} bold>
                            {completed}/32
                          </T>
                          <T muted size={13}>
                            Lessons completed
                          </T>
                        </Card>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Card>
                          <T size={28} bold>
                            8
                          </T>
                          <T muted size={13}>
                            Models to explore
                          </T>
                        </Card>
                      </View>
                    </View>
                    <T size={22} bold>
                      Your next small step
                    </T>
                    <Card>
                      <T size={20} bold>
                        {resume.title}
                      </T>
                      <T muted>{resume.description}</T>
                      <Button
                        title="Open lesson"
                        secondary
                        onPress={() => open(resume)}
                      />
                    </Card>
                    <T muted size={12}>
                      {syncText}
                    </T>
                    {!user && (
                      <Button
                        title="Sign in to save across devices"
                        secondary
                        onPress={() => setAuthOpen(true)}
                      />
                    )}
                  </>
                )}
                {tab === "Learn" && (
                  <>
                    <Field
                      placeholder="Search lessons or hardware parts"
                      value={search}
                      onChange={setSearch}
                    />
                    {modules.map((m, i) => {
                      const items = list.filter((l) => l.module === i);
                      return items.length ? (
                        <View key={m.title} style={{ gap: 12 }}>
                          <T muted size={12}>
                            MODULE {i + 1}
                          </T>
                          <T size={22} bold>
                            {m.title}
                          </T>
                          {items.map((l) => (
                            <Pressable
                              accessibilityRole="button"
                              key={l.id}
                              onPress={() => open(l)}
                            >
                              <Card>
                                <View
                                  style={{
                                    flexDirection: "row",
                                    gap: 12,
                                    alignItems: "center",
                                  }}
                                >
                                  <Ionicons
                                    name={
                                      progress[l.id]?.completed
                                        ? "checkmark-circle"
                                        : "play-circle-outline"
                                    }
                                    size={27}
                                    color={c.accent}
                                  />
                                  <View style={{ flex: 1, gap: 3 }}>
                                    <T bold>{l.title}</T>
                                    <T muted size={13}>
                                      {l.description}
                                    </T>
                                  </View>
                                  {progress[l.id]?.bookmarked && (
                                    <Ionicons
                                      name="bookmark"
                                      size={18}
                                      color={c.accent}
                                    />
                                  )}
                                </View>
                              </Card>
                            </Pressable>
                          ))}
                        </View>
                      ) : null;
                    })}
                    <Card>
                      <T size={20} bold>
                        Simple glossary
                      </T>
                      {Object.entries(glossary)
                        .filter(
                          ([term]) =>
                            !search ||
                            term.toLowerCase().includes(search.toLowerCase()),
                        )
                        .slice(0, search ? 40 : 8)
                        .map(([term, definition]) => (
                          <View key={term}>
                            <T bold>{term}</T>
                            <T muted size={14}>
                              {definition}
                            </T>
                          </View>
                        ))}
                    </Card>
                  </>
                )}
                {tab === "Ask AI" && (
                  <Assistant
                    lesson={resume}
                    speak={speak}
                    audioControls={audioControls}
                    user={!!user}
                    login={() => setAuthOpen(true)}
                  />
                )}
                {tab === "3D Lab" && (
                  <>
                    <T size={28} bold>
                      Meet the parts.{`\n`}From every angle.
                    </T>
                    <T muted>
                      Rotate, zoom, and select a labeled part. The interactive
                      3D viewer needs an internet connection.
                    </T>
                    {(Object.entries(modelNames) as [ModelId, string][]).map(
                      ([id, name]) => (
                        <Button
                          key={id}
                          title={name}
                          icon="cube-outline"
                          secondary
                          onPress={() => setModel(id)}
                        />
                      ),
                    )}
                  </>
                )}
                {tab === "Settings" && (
                  <>
                    <Card>
                      <T size={22} bold>
                        Your learning space
                      </T>
                      <T>{user ? user.name : "Learning as a guest"}</T>
                      <T muted size={13}>
                        {syncText}
                      </T>
                      <Button
                        title={
                          user ? "Sync progress" : "Sign in / create account"
                        }
                        secondary
                        onPress={() => (user ? void sync() : setAuthOpen(true))}
                      />
                      {user && (
                        <Button
                          title="Sign out"
                          secondary
                          onPress={() =>
                            void (async () => {
                              await stopVoice();
                              await api("/api/auth/sign-out", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: "{}",
                              }).catch(() => {});
                              await clearToken();
                              await useAccount(null);
                            })()
                          }
                        />
                      )}
                    </Card>
                    <Card>
                      <T size={20} bold>
                        Appearance
                      </T>
                      <View
                        style={{
                          flexDirection: "row",
                          flexWrap: "wrap",
                          gap: 8,
                        }}
                      >
                        {(["light", "dark", "system"] as const).map((mode) => (
                          <Button
                            key={mode}
                            title={mode}
                            secondary={prefs.theme !== mode}
                            onPress={() => preference({ theme: mode })}
                          />
                        ))}
                      </View>
                      <Toggle
                        title="Larger text"
                        value={prefs.large}
                        onChange={(large) => preference({ large })}
                      />
                      <Toggle
                        title="Reduce motion"
                        value={prefs.reduce}
                        onChange={(reduce) => preference({ reduce })}
                      />
                    </Card>
                    <Card>
                      <T size={20} bold>
                        Voice & audio
                      </T>
                      <Button
                        title="Natural Gemini voice"
                        secondary={prefs.voice !== "natural"}
                        onPress={() => preference({ voice: "natural" })}
                      />
                      <Button
                        title="Installed device voice"
                        secondary={prefs.voice !== "device"}
                        onPress={() => preference({ voice: "device" })}
                      />
                      <T muted size={13}>
                        Natural AI voice needs sign-in and internet. Device
                        speech uses your phone’s voice service. On iPhone, turn
                        off silent mode for device speech.
                      </T>
                      <View style={{ flexDirection: "row", gap: 8 }}>
                        {[0.8, 1, 1.2].map((speed) => (
                          <Button
                            title={`${speed}×`}
                            key={speed}
                            secondary={prefs.speed !== speed}
                            onPress={() => preference({ speed })}
                          />
                        ))}
                      </View>
                      <Button
                        title="Test voice"
                        secondary
                        icon="volume-high-outline"
                        onPress={() =>
                          void speak(
                            "Hello! Let us learn how a computer works, one small step at a time.",
                          )
                        }
                      />
                      {audioControls}
                    </Card>
                    <Card>
                      <T size={20} bold>
                        Offline & privacy
                      </T>
                      <T muted size={14}>
                        All 32 lessons, quizzes, diagrams, and glossary text are
                        bundled. Progress is saved on this device and syncs when
                        you reconnect. YouTube, 3D models, and Gemini need
                        internet. Questions and narration text go to Google when
                        you choose AI features. Your password and session are
                        protected by the phone’s secure storage.
                      </T>
                      <T muted size={12}>
                        Hardware Garden 3.0.1 · Expo native app
                      </T>
                    </Card>
                    <Button
                      title="Open learning website"
                      secondary
                      onPress={() => void Linking.openURL(WEB)}
                    />
                  </>
                )}
              </>
            )}
          </ScrollView>
        )}
        <SafeAreaView
          edges={["bottom"]}
          style={{
            borderTopWidth: 1,
            borderColor: c.line,
            backgroundColor: c.paper,
          }}
        >
          <View
            style={{ flexDirection: "row", paddingTop: 7, paddingBottom: 5 }}
          >
            {nav.map(([name, icon]) => (
              <Pressable
                key={name}
                accessibilityRole="tab"
                accessibilityState={{ selected: tab === name }}
                onPress={() => {
                  void stopVoice();
                  setSelected(null);
                  setTab(name);
                  setSearch("");
                }}
                style={{
                  flex: 1,
                  alignItems: "center",
                  gap: 5,
                  paddingVertical: 8,
                  minHeight: 58,
                }}
              >
                <Ionicons
                  name={icon}
                  size={23}
                  color={tab === name ? c.accent : c.muted}
                />
                <Text
                  style={{
                    fontSize: 10,
                    fontWeight: "600",
                    color: tab === name ? c.accent : c.muted,
                  }}
                >
                  {name}
                </Text>
              </Pressable>
            ))}
          </View>
        </SafeAreaView>
        <Modal
          visible={authOpen}
          animationType="slide"
          onRequestClose={() => setAuthOpen(false)}
        >
          <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
            <ScrollView
              automaticallyAdjustKeyboardInsets
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={{ padding: 24, gap: 20 }}
            >
              <Button
                title="Back to learning"
                secondary
                onPress={() => setAuthOpen(false)}
              />
              <Account
                onSuccess={async () => {
                  const account = await jsonApi("/api/session");
                  if (!account)
                    throw Error("Sign-in did not finish. Please try again.");
                  await useAccount(account);
                  setAuthOpen(false);
                }}
              />
            </ScrollView>
          </SafeAreaView>
        </Modal>
        <Modal
          visible={!!model}
          animationType="slide"
          onRequestClose={() => setModel(null)}
        >
          <SafeAreaView style={{ flex: 1, backgroundColor: c.bg }}>
            <View style={{ padding: 15, gap: 8 }}>
              <Button
                title="Back to Hardware Garden"
                secondary
                onPress={() => setModel(null)}
              />
              <T bold>{model && modelNames[model]}</T>
            </View>
            {model && (
              <WebView
                style={{ flex: 1, backgroundColor: c.bg }}
                source={{ uri: `${WEB}/?embed=1&model=${model}#lab` }}
                originWhitelist={["https://hardware-garden.vercel.app"]}
                onShouldStartLoadWithRequest={(r) =>
                  r.url === "about:blank" || r.url.startsWith(WEB + "/")
                }
                startInLoadingState
                renderLoading={() => <ActivityIndicator color={c.accent} />}
                onError={() =>
                  setNotice(
                    "The 3D viewer needs internet. Your lessons remain available offline.",
                  )
                }
              />
            )}
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </Context.Provider>
  );
}
function Toggle({
  title,
  value,
  onChange,
}: {
  title: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const { c } = React.useContext(Context);
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 15,
        minHeight: 48,
      }}
    >
      <View style={{ flex: 1 }}>
        <T>{title}</T>
      </View>
      <Switch
        accessibilityLabel={title}
        value={value}
        onValueChange={onChange}
        trackColor={{ true: c.accent }}
      />
    </View>
  );
}
function LessonScreen({
  lesson,
  state,
  update,
  speak,
  stop,
  voiceState,
  audioControls,
  model,
}: {
  lesson: Lesson;
  state: Progress;
  update: (p: Partial<Progress>) => void;
  speak: (s: string, done?: () => void) => Promise<void>;
  stop: () => Promise<void>;
  voiceState: string;
  audioControls: React.ReactNode;
  model: () => void;
}) {
  const { c, prefs } = React.useContext(Context);
  const [stage, setStage] = useState(state.step),
    [scene, setScene] = useState(0),
    [answers, setAnswers] = useState<Record<number, number>>({}),
    [submitted, setSubmitted] = useState(false),
    [activities, setActivities] = useState<number[]>([]),
    [auto, setAuto] = useState(false);
  const story = chapterStories[lesson.id],
    bob = useRef(new Animated.Value(0)).current;
  const change = (n: number) => {
    void stop();
    setAuto(false);
    setStage(n);
    update({ step: n, positionAt: Date.now() });
  };
  useEffect(() => {
    if (prefs.reduce || !auto) return;
    const a = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: -8,
          duration: 1100,
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: 1100,
          useNativeDriver: true,
        }),
      ]),
    );
    a.start();
    return () => {
      a.stop();
      bob.setValue(0);
    };
  }, [auto, prefs.reduce]);
  async function narrate(n: number) {
    setScene(n);
    setAuto(true);
    await speak(story.captions[n], () => {
      if (n < 3) void narrate(n + 1);
      else setAuto(false);
    });
  }
  return (
    <>
      <T muted size={12}>
        MODULE {lesson.module + 1} · {modules[lesson.module].title}
      </T>
      <T size={29} bold>
        {lesson.title}
      </T>
      <T muted>{lesson.description}</T>
      <Button
        title={state.bookmarked ? "Saved lesson" : "Save lesson"}
        icon={state.bookmarked ? "bookmark" : "bookmark-outline"}
        secondary
        onPress={() =>
          update({ bookmarked: !state.bookmarked, bookmarkAt: Date.now() })
        }
      />
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 8 }}
      >
        {["Learn", "Watch", "Explore", "Try it", "Quiz"].map((t, i) => (
          <Button
            key={t}
            title={`${i + 1} ${t}`}
            secondary={stage !== i}
            onPress={() => change(i)}
          />
        ))}
      </ScrollView>
      {lesson.safety && (
        <Card>
          <T bold>Safety first</T>
          <T size={14}>{lesson.safety}</T>
        </Card>
      )}
      {stage === 0 && (
        <>
          {lesson.steps.map((s, i) => {
            const video = sectionVideo(lesson.id, i);
            return (
              <Card key={i}>
                <T muted size={12}>
                  SECTION {i + 1}
                </T>
                <T size={21} bold>
                  {s.title}
                </T>
                <T>{s.text}</T>
                <Button
                  title="Listen to this section"
                  icon="volume-high-outline"
                  secondary
                  onPress={() => void speak(s.text)}
                />
                <View
                  style={{
                    padding: 18,
                    borderRadius: 15,
                    backgroundColor: c.tint,
                    gap: 10,
                  }}
                >
                  <Ionicons name="logo-youtube" size={32} color={c.accent} />
                  <T bold>{video.title}</T>
                  <T muted size={12}>
                    {video.author} · related video
                  </T>
                  <Button
                    title="Watch on YouTube"
                    icon="open-outline"
                    onPress={() => {
                      void stop();
                      void Linking.openURL(youtubeUrl(video));
                    }}
                  />
                </View>
              </Card>
            );
          })}
          <Card>
            <T bold>The simple version</T>
            <T>{lesson.simple}</T>
          </Card>
          <Card>
            <T bold>Words you just met</T>
            {lesson.terms.map((t) => (
              <View key={t}>
                <T bold>{t}</T>
                <T muted size={14}>
                  {glossary[t]}
                </T>
              </View>
            ))}
          </Card>
        </>
      )}
      {stage === 1 && (
        <>
          <T size={22} bold>
            {story.question}
          </T>
          <Card>
            <T muted size={12}>
              SCENE {scene + 1} / 4
            </T>
            <Animated.View
              style={{
                alignItems: "center",
                padding: 35,
                transform: [{ translateY: bob }],
              }}
            >
              <Ionicons
                name={
                  [
                    "download-outline",
                    "hardware-chip-outline",
                    "desktop-outline",
                    "bulb-outline",
                  ][scene] as any
                }
                size={95}
                color={c.accent}
              />
            </Animated.View>
            <T size={25} bold>
              {story.scenes[scene]}
            </T>
            <T size={19}>{story.captions[scene]}</T>
            <Button
              title={voiceState ? "Stop narration" : "Play narrated story"}
              icon={voiceState ? "stop" : "play"}
              onPress={() => {
                if (voiceState) {
                  void stop();
                  setAuto(false);
                } else void narrate(scene);
              }}
            />
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
              {story.scenes.map((s, i) => (
                <Button
                  key={i}
                  title={`${i + 1}`}
                  secondary={scene !== i}
                  onPress={() => {
                    void stop();
                    setAuto(false);
                    setScene(i);
                  }}
                />
              ))}
            </View>
            <T muted size={14}>
              {story.takeaway}
            </T>
          </Card>
          {lesson.steps.map((s, i) => (
            <Button
              title={`Section ${i + 1}: ${sectionVideo(lesson.id, i).title}`}
              key={i}
              secondary
              icon="logo-youtube"
              onPress={() =>
                void Linking.openURL(youtubeUrl(sectionVideo(lesson.id, i)))
              }
            />
          ))}
        </>
      )}
      {stage === 2 && (
        <Card>
          <Ionicons name="cube-outline" size={70} color={c.accent} />
          <T size={24} bold>
            {modelNames[lesson.model]}
          </T>
          <T>
            Rotate, zoom, and select labeled parts in the interactive model.
          </T>
          <Button title="Explore 3D model" onPress={model} />
          <T muted size={13}>
            Online 3D viewer. Lesson diagrams and explanations stay available
            offline.
          </T>
          {lesson.animation.labels.map((s, i) => (
            <View
              key={s}
              style={{
                padding: 14,
                backgroundColor: c.tint,
                borderRadius: 12,
                gap: 6,
              }}
            >
              <T bold>
                {i + 1}. {s}
              </T>
              <T muted>{lesson.animation.captions[i]}</T>
            </View>
          ))}
        </Card>
      )}
      {stage === 3 && (
        <>
          <T size={24} bold>
            One small step at a time
          </T>
          {lesson.activity.map((s, i) => (
            <Pressable
              accessibilityRole="checkbox"
              accessibilityState={{ checked: activities.includes(i) }}
              key={i}
              onPress={() =>
                setActivities(
                  activities.includes(i)
                    ? activities.filter((v) => v !== i)
                    : [...activities, i],
                )
              }
            >
              <Card>
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <Ionicons
                    name={
                      activities.includes(i) ? "checkbox" : "square-outline"
                    }
                    size={26}
                    color={c.accent}
                  />
                  <View style={{ flex: 1 }}>
                    <T>{s}</T>
                  </View>
                </View>
              </Card>
            </Pressable>
          ))}
          <T muted>{activities.length} of 3 explored</T>
        </>
      )}
      {stage === 4 && (
        <>
          {lesson.quiz.map((q, i) => (
            <Card key={q.question}>
              <T bold>
                {i + 1}. {q.question}
              </T>
              {q.options.map((o, j) => (
                <Button
                  key={o}
                  title={o}
                  secondary={answers[i] !== j}
                  disabled={submitted}
                  onPress={() => setAnswers({ ...answers, [i]: j })}
                />
              ))}
              {submitted && (
                <T size={14}>
                  {answers[i] === q.answer
                    ? "✓ Correct. "
                    : "Let’s learn from this. "}
                  {q.explanation}
                </T>
              )}
            </Card>
          ))}
          {!submitted ? (
            <Button
              title="Check my answers"
              disabled={Object.keys(answers).length < 3}
              onPress={() => {
                setSubmitted(true);
                update({
                  score: Math.max(
                    state.score,
                    lesson.quiz.filter((q, i) => answers[i] === q.answer)
                      .length,
                  ),
                  step: 4,
                  positionAt: Date.now(),
                });
              }}
            />
          ) : (
            <>
              <Button
                title={state.completed ? "Lesson completed ✓" : "Finish lesson"}
                onPress={() =>
                  update({ completed: true, step: 4, positionAt: Date.now() })
                }
              />
              <Button
                title="Try the quiz again"
                secondary
                onPress={() => {
                  setAnswers({});
                  setSubmitted(false);
                }}
              />
            </>
          )}
        </>
      )}
      {audioControls}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          gap: 12,
        }}
      >
        <Button
          title="Back"
          secondary
          disabled={stage === 0}
          onPress={() => change(stage - 1)}
        />
        <T muted size={13}>
          {stage + 1} / 5
        </T>
        <Button
          title="Next"
          disabled={stage === 4}
          onPress={() => change(stage + 1)}
        />
      </View>
    </>
  );
}
function Assistant({
  lesson,
  speak,
  audioControls,
  user,
  login,
}: {
  lesson: Lesson;
  speak: (s: string) => Promise<void>;
  audioControls: React.ReactNode;
  user: boolean;
  login: () => void;
}) {
  const [q, setQ] = useState(""),
    [reply, setReply] = useState<Explanation | null>(null),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  async function ask(question: string) {
    if (!question.trim()) return;
    setBusy(true);
    setNotice("");
    let result = courseExplanation(question, lesson);
    if (user)
      try {
        result = await jsonApi("/api/assistant", {
          question,
          lessonId: lesson.id,
        });
      } catch {
        setNotice(
          "Gemini is unavailable. Here is the built-in course explanation.",
        );
      }
    else setNotice("Built-in course guide. Sign in for Gemini answers.");
    setReply(result);
    setBusy(false);
  }
  return (
    <>
      <T size={29} bold>
        A little help,{`\n`}whenever you need it.
      </T>
      <T muted>
        Ask about hardware in your own words. Don’t include personal
        information.
      </T>
      <Field
        value={q}
        onChange={setQ}
        placeholder="Why does a computer need RAM?"
      />
      <Button
        title={busy ? "Thinking…" : "Ask the learning assistant"}
        icon="sparkles-outline"
        disabled={busy || !q.trim()}
        onPress={() => void ask(q)}
      />
      <Button
        title="Explain my current lesson simply"
        secondary
        disabled={busy}
        onPress={() => void ask(`Explain ${lesson.title} simply`)}
      />
      {notice && (
        <T size={13} muted>
          {notice}
        </T>
      )}
      {!user && <Button title="Sign in" secondary onPress={login} />}{" "}
      {reply && (
        <Card>
          <T muted size={12}>
            {reply.source === "gemini"
              ? "GEMINI AI · may make mistakes"
              : "BUILT-IN COURSE GUIDE"}
          </T>
          <T size={23} bold>
            {reply.title}
          </T>
          <T>{reply.answer}</T>
          <Button
            title="Listen to explanation"
            icon="volume-high-outline"
            secondary
            onPress={() => void speak(reply.answer)}
          />
          {reply.steps.map((s, i) => (
            <View key={i}>
              <T bold>
                {i + 1}. {s.label}
              </T>
              <T muted>{s.detail}</T>
            </View>
          ))}
          <T>{reply.analogy}</T>
          <T bold>Try this</T>
          <T>{reply.check}</T>
        </Card>
      )}
      {audioControls}
    </>
  );
}
function Account({ onSuccess }: { onSuccess: () => Promise<void> }) {
  const [username, setUsername] = useState(""),
    [password, setPassword] = useState(""),
    [email, setEmail] = useState(""),
    [signup, setSignup] = useState(false),
    [busy, setBusy] = useState(false),
    [error, setError] = useState("");
  async function submit() {
    setBusy(true);
    setError("");
    try {
      await jsonApi(
        signup ? "/api/auth/sign-up/email" : "/api/auth/sign-in/username",
        signup
          ? { name: username, username, email, password }
          : { username, password },
      );
      await onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Sign-in failed.");
    } finally {
      setBusy(false);
    }
  }
  async function google() {
    setBusy(true);
    setError("");
    try {
      const bytes = await Crypto.getRandomBytesAsync(32),
        verifier = Array.from(bytes, (b) =>
          b.toString(16).padStart(2, "0"),
        ).join(""),
        state = Array.from(await Crypto.getRandomBytesAsync(16), (b) =>
          b.toString(16).padStart(2, "0"),
        ).join("");
      const challenge = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        verifier,
      );
      await saveOAuthProof(state, verifier);
      const returnTo =
        Constants.executionEnvironment === "storeClient"
          ? "exp://u.expo.dev/941002a8-412b-41a9-8c1f-038bfb9e9f43?channel-name=preview&runtime-version=exposdk%3A58.0.0"
          : "hardwaregardenexpo://auth";
      const result = await WebBrowser.openAuthSessionAsync(
        `${API}/mobile-auth?provider=google&state=${state}&challenge=${challenge}&returnTo=${encodeURIComponent(returnTo)}`,
        returnTo,
      );
      if (result.type === "success" && (await finishOAuth(result.url))) {
        await onSuccess();
      } else
        setError(
          "If Expo Go did not reopen, copy the sign-in code from the browser and paste it below. It expires after one minute.",
        );
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Google sign-in could not finish.",
      );
    } finally {
      setBusy(false);
    }
  }
  const expoGo = Constants.executionEnvironment === "storeClient";
  const [code, setCode] = useState("");
  return (
    <>
      <T size={30} bold>
        Your learning,{`\n`}wherever you go.
      </T>
      <T muted>
        {signup
          ? "Create your own learning account."
          : "Sign in to keep your progress across devices."}
      </T>
      <Field placeholder="Username" value={username} onChange={setUsername} />
      {signup && (
        <Field placeholder="Email address" value={email} onChange={setEmail} />
      )}
      <Field
        placeholder="Password · at least 12 characters"
        value={password}
        onChange={setPassword}
        secure
      />
      <Button
        title={busy ? "Just a moment…" : signup ? "Create account" : "Sign in"}
        disabled={
          busy || !username || password.length < 12 || (signup && !email)
        }
        onPress={() => void submit()}
      />
      <Button
        title={
          signup ? "I already have an account" : "Create a learning account"
        }
        secondary
        disabled={busy}
        onPress={() => {
          setSignup(!signup);
          setError("");
        }}
      />
      {
        <Button
          title="Continue with Google"
          secondary
          disabled={busy}
          onPress={() => void google()}
        />
      }
      {expoGo && (
        <>
          <Field
            value={code}
            onChange={setCode}
            placeholder="Optional: paste Google sign-in code"
          />
          <Button
            title="Finish Google sign-in"
            secondary
            disabled={busy || !code.trim()}
            onPress={() => {
              setBusy(true);
              void finishOAuth(code)
                .then(async (ok) => {
                  if (!ok)
                    throw Error(
                      "Copy the complete sign-in code from the browser.",
                    );
                  await onSuccess();
                })
                .catch((e) => setError(e.message))
                .finally(() => setBusy(false));
            }}
          />
        </>
      )}
      <T muted size={12}>
        {expoGo
          ? "Google opens your browser. If the return link does not reopen Expo Go, paste the one-time code above. Username/password also works."
          : "Google opens securely in your browser. Apple sign-in is not configured."}
      </T>
      {error && <T size={14}>{error}</T>}
    </>
  );
}
export default function App() {
  return (
    <SafeAreaProvider>
      <NativeApp />
    </SafeAreaProvider>
  );
}
