import { useState, useMemo, useEffect } from 'react';
import { 
  MantineProvider,
  AppShell, 
  Container, 
  Group, 
  Stack, 
  Text, 
  Title, 
  Badge, 
  Card, 
  ActionIcon, 
  Button, 
  SegmentedControl, 
  Drawer, 
  Timeline, 
  Affix, 
  Paper, 
  Modal, 
  Switch, 
  SimpleGrid, 
  Divider, 
  Box, 
  rem,
  Menu,
  ThemeIcon,
  Progress,
  Alert,
  ScrollArea
} from '@mantine/core';
import { Notifications, notifications } from '@mantine/notifications';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CloudRain, 
  Sun, 
  Moon,
  Sparkles,
  AlertTriangle, 
  Check, 
  Plus, 
  Clock, 
  Navigation, 
  Share2, 
  Trash2, 
  Info, 
  ChevronUp, 
  MapPin, 
  Coffee, 
  Landmark, 
  Compass, 
  Building2, 
  Beer,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { defaultTheme, customNordicTheme } from './theme';
import { STOCKHOLM_PLACES } from './data/places';
import { Place } from './types';
import { haptics } from './utils/haptics';

type ThemeMode = 'light' | 'dark' | 'custom';

export default function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    try {
      const saved = localStorage.getItem('sthlm_theme_mode');
      return (saved === 'light' || saved === 'dark' || saved === 'custom') ? saved : 'dark';
    } catch {
      return 'dark';
    }
  });

  const [places] = useState<Place[]>(STOCKHOLM_PLACES);
  const [dayQueue, setDayQueue] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('sthlm_day_queue');
      return saved ? JSON.parse(saved) : ['vasa-museum', 'fotografiska', 'vete-katten-fika'];
    } catch {
      return ['vasa-museum', 'fotografiska', 'vete-katten-fika'];
    }
  });

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [rainMode, setRainMode] = useState<boolean>(false);
  const [isTrayOpen, setIsTrayOpen] = useState<boolean>(false);
  const [showSosModal, setShowSosModal] = useState<boolean>(false);
  const [activeDetailId, setActiveDetailId] = useState<string | null>(null);

  // Onboarding & Coach Marks State
  const [showOnboarding, setShowOnboarding] = useState<boolean>(false);
  const [onboardingStep, setOnboardingStep] = useState<number>(0);
  const [showCoachMark, setShowCoachMark] = useState<boolean>(false);
  const [coachStep, setCoachStep] = useState<number>(0);

  // Check initial visit for onboarding
  useEffect(() => {
    try {
      const seen = localStorage.getItem('sthlm_onboarding_completed');
      if (!seen) {
        setShowOnboarding(true);
      }
    } catch (e) {
      console.warn(e);
    }
  }, []);

  const completeOnboarding = (startCoach: boolean = true) => {
    haptics.medium();
    try {
      localStorage.setItem('sthlm_onboarding_completed', 'true');
    } catch (e) {
      console.warn(e);
    }
    setShowOnboarding(false);
    if (startCoach) {
      setCoachStep(0);
      setShowCoachMark(true);
    }
  };

  const nextCoachStep = () => {
    haptics.light();
    if (coachStep < 3) {
      setCoachStep((prev) => prev + 1);
    } else {
      setShowCoachMark(false);
      haptics.success();
      notifications.show({
        title: 'You are all set!',
        message: 'Tap any card or switch vibes to build your perfect Stockholm day.',
        color: accentColor,
      });
    }
  };

  // Active theme & color scheme selection
  const activeTheme = useMemo(() => {
    return themeMode === 'custom' ? customNordicTheme : defaultTheme;
  }, [themeMode]);

  const activeColorScheme = useMemo(() => {
    return themeMode === 'light' ? 'light' : 'dark';
  }, [themeMode]);

  const accentColor = useMemo(() => {
    return themeMode === 'custom' ? 'emerald' : 'blue';
  }, [themeMode]);

  // Sync state to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sthlm_theme_mode', themeMode);
    } catch (e) {
      console.warn('Could not save theme preference', e);
    }
  }, [themeMode]);

  useEffect(() => {
    try {
      localStorage.setItem('sthlm_day_queue', JSON.stringify(dayQueue));
    } catch (e) {
      console.warn('Could not save queue', e);
    }
  }, [dayQueue]);

  const toggleQueue = (id: string) => {
    haptics.medium();
    const place = places.find(p => p.id === id);
    const isAdding = !dayQueue.includes(id);

    setDayQueue((prev) => 
      isAdding ? [...prev, id] : prev.filter((item) => item !== id)
    );

    if (place) {
      notifications.show({
        title: isAdding ? 'Added to Day Plan' : 'Removed from Day Plan',
        message: `${place.title} (${place.neighborhood})`,
        color: isAdding ? accentColor : 'gray',
        autoClose: 1800,
      });
    }
  };

  const filteredPlaces = useMemo(() => {
    return places.filter((place) => {
      if (rainMode && !place.isIndoor) return false;
      if (activeCategory === 'all') return true;
      if (activeCategory === 'free') return place.costSek === 0;
      return place.category === activeCategory;
    });
  }, [places, activeCategory, rainMode]);

  const queuedPlaces = useMemo(() => {
    return dayQueue
      .map((id) => places.find((p) => p.id === id))
      .filter((p): p is Place => Boolean(p));
  }, [dayQueue, places]);

  const totalCostSek = useMemo(() => {
    return queuedPlaces.reduce((sum, p) => sum + p.costSek, 0);
  }, [queuedPlaces]);

  const totalDurationMin = useMemo(() => {
    return queuedPlaces.reduce((sum, p) => sum + p.durationMin, 0);
  }, [queuedPlaces]);

  const groupedByIsland = useMemo(() => {
    const groups: Record<string, Place[]> = {};
    queuedPlaces.forEach((place) => {
      const island = place.neighborhood;
      if (!groups[island]) groups[island] = [];
      groups[island].push(place);
    });
    return groups;
  }, [queuedPlaces]);

  const activeDetailPlace = useMemo(() => {
    return places.find((p) => p.id === activeDetailId);
  }, [places, activeDetailId]);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'museum': return <Landmark size={14} />;
      case 'eats-fika': return <Coffee size={14} />;
      case 'tech-mba': return <Building2 size={14} />;
      case 'nightlife': return <Beer size={14} />;
      default: return <Compass size={14} />;
    }
  };

  return (
    <MantineProvider theme={activeTheme} forceColorScheme={activeColorScheme}>
      <Notifications position="top-center" zIndex={1000} />

      <AppShell
        header={{ height: 116 }}
        padding="0"
        style={{ minHeight: '100vh' }}
      >
        {/* App Header */}
        <AppShell.Header px="md" py="xs">
          <Container size="xs" px={0}>
            <Group justify="space-between" align="center">
              <div>
                <Text 
                  size="xs" 
                  fw={700} 
                  c={accentColor}
                  ff="monospace"
                  tt="uppercase"
                  lts={rem(1.5)}
                >
                  Stockholm · MBA Guide
                </Text>
                <Title order={3} fw={700} style={{ letterSpacing: '-0.02em' }}>
                  Pick Your Day
                </Title>
              </div>

              <Group gap="xs">
                {/* Onboarding Help Re-trigger */}
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="lg"
                  radius="xl"
                  onClick={() => {
                    haptics.light();
                    setOnboardingStep(0);
                    setShowOnboarding(true);
                  }}
                  title="How this app works (Tour)"
                >
                  <HelpCircle size={18} />
                </ActionIcon>

                {/* 3-Theme Menu Selector */}
                <Menu shadow="md" width={160} position="bottom-end">
                  <Menu.Target>
                    <ActionIcon 
                      variant="subtle" 
                      color="gray" 
                      size="lg" 
                      radius="xl"
                      title="Switch Theme"
                      onClick={() => haptics.light()}
                    >
                      {themeMode === 'light' && <Sun size={18} />}
                      {themeMode === 'dark' && <Moon size={18} />}
                      {themeMode === 'custom' && <Sparkles size={18} />}
                    </ActionIcon>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Label>Theme Selection</Menu.Label>
                    <Menu.Item 
                      leftSection={<Sun size={15} />}
                      onClick={() => {
                        haptics.medium();
                        setThemeMode('light');
                      }}
                      color={themeMode === 'light' ? accentColor : undefined}
                      fw={themeMode === 'light' ? 700 : 400}
                    >
                      Default Light
                    </Menu.Item>
                    <Menu.Item 
                      leftSection={<Moon size={15} />}
                      onClick={() => {
                        haptics.medium();
                        setThemeMode('dark');
                      }}
                      color={themeMode === 'dark' ? accentColor : undefined}
                      fw={themeMode === 'dark' ? 700 : 400}
                    >
                      Default Dark
                    </Menu.Item>
                    <Menu.Item 
                      leftSection={<Sparkles size={15} />}
                      onClick={() => {
                        haptics.medium();
                        setThemeMode('custom');
                      }}
                      color={themeMode === 'custom' ? accentColor : undefined}
                      fw={themeMode === 'custom' ? 700 : 400}
                    >
                      Custom Nordic
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>

                {/* Rain Mode Switch */}
                <Box 
                  style={{ 
                    outline: (showCoachMark && coachStep === 1) ? `2px solid var(--mantine-color-blue-filled)` : undefined, 
                    borderRadius: '9999px',
                    padding: rem(2)
                  }}
                >
                  <Switch
                    size="md"
                    color="blue"
                    checked={rainMode}
                    onChange={(event) => {
                      haptics.medium();
                      setRainMode(event.currentTarget.checked);
                    }}
                    onLabel={<CloudRain size={13} color="white" />}
                    offLabel={<Sun size={13} color="#f59e0b" />}
                    aria-label="Toggle Rain Mode"
                  />
                </Box>

                {/* Transit SOS Button */}
                <Box 
                  style={{ 
                    outline: (showCoachMark && coachStep === 2) ? `2px solid var(--mantine-color-yellow-filled)` : undefined, 
                    borderRadius: '9999px' 
                  }}
                >
                  <ActionIcon
                    variant="light"
                    color="yellow"
                    radius="xl"
                    size="lg"
                    onClick={() => {
                      haptics.warning();
                      setShowSosModal(true);
                    }}
                    title="Transit warnings & student ID rules"
                  >
                    <AlertTriangle size={18} />
                  </ActionIcon>
                </Box>
              </Group>
            </Group>

            {/* Vibe Category Segmented Control */}
            <ScrollArea type="never" mt="xs" offsetScrollbars={false}>
              <SegmentedControl
                size="xs"
                radius="xl"
                value={activeCategory}
                onChange={(val) => {
                  haptics.light();
                  setActiveCategory(val);
                }}
                color={accentColor}
                data={[
                  { label: 'All', value: 'all' },
                  { label: 'Free Only', value: 'free' },
                  { label: 'Culture', value: 'museum' },
                  { label: 'Tech & MBA', value: 'tech-mba' },
                  { label: 'Fika & Food', value: 'eats-fika' },
                  { label: 'Nightlife', value: 'nightlife' },
                ]}
              />
            </ScrollArea>
          </Container>
        </AppShell.Header>

        {/* Places Feed with Framer Motion Layout Springs */}
        <AppShell.Main pt="xs" pb={rem(140)}>
          <Container size="xs" px="md">
            <AnimatePresence>
              {rainMode && (
                <motion.div
                  initial={{ opacity: 0, height: 0, scale: 0.95 }}
                  animate={{ opacity: 1, height: 'auto', scale: 1 }}
                  exit={{ opacity: 0, height: 0, scale: 0.95 }}
                  transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                >
                  <Alert 
                    variant="light" 
                    color="blue" 
                    title="Rain & Cold Weather Mode Active" 
                    icon={<CloudRain size={18} />}
                    radius="lg" 
                    mb="md"
                  >
                    Outdoor cliff walks hidden; showing indoor architecture gems (ArkDes) and covered food halls.
                  </Alert>
                </motion.div>
              )}
            </AnimatePresence>

            <Group justify="space-between" mb="xs" px={rem(2)}>
              <Text size="xs" c="dimmed" fw={500}>
                {filteredPlaces.length} places available
              </Text>
              <Text size="xs" c="dimmed">
                Tap '+' to queue into your day
              </Text>
            </Group>

            {/* Tactile Motion Card Stack */}
            <Stack gap="sm">
              <AnimatePresence mode="popLayout">
                {filteredPlaces.map((place, idx) => {
                  const isQueued = dayQueue.includes(place.id);
                  const isFirstCardTarget = idx === 0 && showCoachMark && coachStep === 0;

                  return (
                    <motion.div
                      key={place.id}
                      layout
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Card 
                        withBorder
                        radius="lg"
                        p="md"
                        style={{
                          borderColor: isFirstCardTarget ? 'var(--mantine-primary-color-filled)' : undefined,
                          boxShadow: isFirstCardTarget ? '0 0 0 2px var(--mantine-primary-color-filled)' : undefined,
                          transition: 'border-color 150ms ease, box-shadow 150ms ease'
                        }}
                      >
                        <Group justify="space-between" align="flex-start" wrap="nowrap">
                          <Box style={{ flex: 1, minWidth: 0 }}>
                            <Group gap="xs" mb={6}>
                              <Badge 
                                variant="light" 
                                color="gray" 
                                size="xs"
                                leftSection={getCategoryIcon(place.category)}
                              >
                                {place.neighborhood}
                              </Badge>
                              <Badge 
                                variant="outline" 
                                color={place.costSek === 0 ? accentColor : 'gray'} 
                                size="xs"
                              >
                                {place.costLabel}
                              </Badge>
                              <Group gap={3} c="dimmed">
                                <Clock size={12} />
                                <Text size="xs" span ff="monospace">{place.durationMin}m</Text>
                              </Group>
                            </Group>

                            <Title order={5} fw={600} style={{ lineHeight: 1.3 }}>
                              {place.title}
                            </Title>

                            <Text size="xs" c="dimmed" lineClamp={2} mt={4} lh="md">
                              {place.mbaNote}
                            </Text>

                            <Group gap="xs" mt="xs">
                              <Button
                                variant="subtle"
                                color="gray"
                                size="compact-xs"
                                leftSection={<Info size={12} />}
                                onClick={() => {
                                  haptics.light();
                                  setActiveDetailId(place.id);
                                }}
                              >
                                Tips & Transit
                              </Button>

                              {place.studentDiscountNote.includes('French') && (
                                <Badge variant="dot" color="indigo" size="xs">
                                  French MBA ID OK
                                </Badge>
                              )}
                            </Group>
                          </Box>

                          {/* Spring-Compressed Action Button */}
                          <motion.div whileTap={{ scale: 0.85 }}>
                            <ActionIcon
                              variant={isQueued ? 'filled' : 'light'}
                              color={isQueued ? accentColor : 'gray'}
                              size="lg"
                              radius="md"
                              onClick={() => toggleQueue(place.id)}
                              aria-label={isQueued ? 'Remove from day' : 'Add to day'}
                            >
                              {isQueued ? <Check size={16} strokeWidth={2.5} /> : <Plus size={16} />}
                            </ActionIcon>
                          </motion.div>
                        </Group>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </Stack>
          </Container>
        </AppShell.Main>

        {/* Sticky Floating Day Tray Dock with Spring Physics */}
        <Affix position={{ bottom: 16, right: 16, left: 16 }}>
          <Container size="xs" px={0}>
            <motion.div
              whileTap={{ scale: 0.98, y: 1 }}
              transition={{ type: 'spring', stiffness: 500, damping: 25 }}
            >
              <Paper
                withBorder
                shadow="xl"
                radius="xl"
                p="xs"
                style={{
                  cursor: 'pointer',
                  backdropFilter: 'blur(16px)',
                  boxShadow: (showCoachMark && coachStep === 3) ? '0 0 0 2px var(--mantine-primary-color-filled)' : undefined,
                }}
                onClick={() => {
                  haptics.medium();
                  setIsTrayOpen(true);
                }}
              >
                <Group justify="space-between" align="center" px="xs">
                  <Group gap="sm">
                    <motion.div
                      key={dayQueue.length}
                      initial={{ scale: 1.3 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 20 }}
                    >
                      <Badge 
                        size="xl" 
                        circle 
                        color={accentColor} 
                        variant="light"
                        ff="monospace"
                        fw={700}
                      >
                        {dayQueue.length}
                      </Badge>
                    </motion.div>
                    <div>
                      <Group gap={6} align="center">
                        <Text size="xs" fw={700}>
                          My Stockholm Day
                        </Text>
                        <Badge size="xs" variant="outline" color="gray">
                          {Math.round(totalDurationMin / 60 * 10) / 10} hrs
                        </Badge>
                      </Group>
                      <Text size="xs" c="dimmed" ff="monospace">
                        Spend: {totalCostSek} SEK (~€{Math.round(totalCostSek / 11.2)})
                      </Text>
                    </div>
                  </Group>

                  <Button
                    variant="light"
                    color={accentColor}
                    size="xs"
                    radius="xl"
                    rightSection={<ChevronUp size={14} />}
                  >
                    View Route
                  </Button>
                </Group>
              </Paper>
            </motion.div>
          </Container>
        </Affix>

        {/* Day Tray Drawer with Slide Gestures */}
        <Drawer
          opened={isTrayOpen}
          onClose={() => {
            haptics.light();
            setIsTrayOpen(false);
          }}
          position="bottom"
          size="85%"
          radius="xl"
          title={
            <div>
              <Title order={4} fw={700}>
                Your Curated Day Route
              </Title>
              <Text size="xs" c="dimmed">
                Auto-clustered by island to stop transit backtracking
              </Text>
            </div>
          }
        >
          <Stack gap="lg" mt="sm">
            {Object.keys(groupedByIsland).length === 0 ? (
              <Text size="sm" c="dimmed" ta="center" py="xl">
                Your day tray is empty. Tap '+' on cards to start planning!
              </Text>
            ) : (
              <Timeline active={Object.keys(groupedByIsland).length} bulletSize={28} lineWidth={2} color={accentColor}>
                {Object.entries(groupedByIsland).map(([island, items]) => (
                  <Timeline.Item 
                    key={island} 
                    bullet={<MapPin size={14} />}
                    title={
                      <Group gap="xs">
                        <Text size="xs" fw={700} ff="monospace" tt="uppercase" lts={rem(1)} c={accentColor}>
                          Island Hub: {island}
                        </Text>
                        <Badge size="xs" variant="light" color="gray">
                          {items.length} {items.length === 1 ? 'spot' : 'spots'}
                        </Badge>
                      </Group>
                    }
                  >
                    <Stack gap="xs" mt="xs">
                      {items.map((place) => (
                        <Paper 
                          key={place.id}
                          withBorder
                          p="xs"
                          radius="md"
                        >
                          <Group justify="space-between" align="flex-start" wrap="nowrap">
                            <div>
                              <Text size="xs" fw={600}>{place.title}</Text>
                              <Text size="xs" c="dimmed" mt={2}>{place.transitTip}</Text>
                              <Text size="xs" c={accentColor} mt={4} ff="monospace">
                                {place.costLabel} · {place.durationMin}m
                              </Text>
                            </div>
                            <ActionIcon
                              variant="subtle"
                              color="gray"
                              size="sm"
                              onClick={() => toggleQueue(place.id)}
                              title="Remove"
                            >
                              <Trash2 size={13} />
                            </ActionIcon>
                          </Group>
                        </Paper>
                      ))}
                    </Stack>
                  </Timeline.Item>
                ))}
              </Timeline>
            )}

            {queuedPlaces.length > 0 && (
              <Paper withBorder radius="lg" p="md">
                <Text size="xs" fw={700} mb="xs">
                  Budget & Transit Summary
                </Text>
                <SimpleGrid cols={2} spacing="xs">
                  <div>
                    <Text size="xs" c="dimmed">Activities:</Text>
                    <Text size="xs" fw={600} ff="monospace">{totalCostSek} SEK</Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">Est. Duration:</Text>
                    <Text size="xs" fw={600} ff="monospace">{Math.round(totalDurationMin / 60 * 10) / 10}h</Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">SL Transit:</Text>
                    <Text size="xs" fw={600} ff="monospace">
                      {Object.keys(groupedByIsland).length} taps (~{Object.keys(groupedByIsland).length * 43} SEK)
                    </Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">Euro Equiv:</Text>
                    <Text size="xs" fw={700} c={accentColor} ff="monospace">
                      ~€{Math.round((totalCostSek + Object.keys(groupedByIsland).length * 43) / 11.2)}
                    </Text>
                  </div>
                </SimpleGrid>
              </Paper>
            )}

            <Group grow>
              <Button
                color={accentColor}
                radius="md"
                leftSection={<Share2 size={15} />}
                onClick={() => {
                  haptics.success();
                  navigator.clipboard?.writeText(
                    `My Stockholm Day:\n` +
                    queuedPlaces.map((p, i) => `${i + 1}. ${p.title} (${p.neighborhood})`).join('\n') +
                    `\nTotal Budget: ~${totalCostSek} SEK`
                  );
                  notifications.show({
                    title: 'Itinerary Copied',
                    message: 'Formatted route copied to clipboard for WhatsApp!',
                    color: accentColor,
                  });
                }}
              >
                Copy Route Plan
              </Button>
              <Button
                variant="light"
                color="gray"
                radius="md"
                onClick={() => {
                  haptics.light();
                  setDayQueue([]);
                }}
              >
                Clear
              </Button>
            </Group>
          </Stack>
        </Drawer>

        {/* Place Details Modal */}
        <Modal
          opened={Boolean(activeDetailPlace)}
          onClose={() => {
            haptics.light();
            setActiveDetailId(null);
          }}
          title={
            activeDetailPlace && (
              <Group gap="xs">
                <Badge variant="light" color={accentColor} size="xs">
                  {activeDetailPlace.neighborhood}
                </Badge>
                <Text size="sm" fw={700}>
                  {activeDetailPlace.title}
                </Text>
              </Group>
            )
          }
        >
          {activeDetailPlace && (
            <Stack gap="md">
              <div>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={rem(1)}>
                  Why It Fits An MBA Student
                </Text>
                <Text size="xs" mt={3} lh="md">
                  {activeDetailPlace.mbaNote}
                </Text>
              </div>

              <div>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={rem(1)}>
                  Transit Tip
                </Text>
                <Text size="xs" mt={3}>
                  {activeDetailPlace.transitTip}
                </Text>
              </div>

              <div>
                <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={rem(1)}>
                  Student & Pricing Policy
                </Text>
                <Text size="xs" mt={3}>
                  {activeDetailPlace.studentDiscountNote}
                </Text>
              </div>

              <Divider />

              <Group grow>
                <Button
                  color={dayQueue.includes(activeDetailPlace.id) ? 'red' : accentColor}
                  variant={dayQueue.includes(activeDetailPlace.id) ? 'light' : 'filled'}
                  radius="md"
                  onClick={() => {
                    toggleQueue(activeDetailPlace.id);
                    setActiveDetailId(null);
                  }}
                >
                  {dayQueue.includes(activeDetailPlace.id) ? 'Remove from Day' : '+ Add to Day'}
                </Button>
                <Button
                  component="a"
                  href={`https://maps.apple.com/?q=${encodeURIComponent(activeDetailPlace.title + ' Stockholm')}`}
                  target="_blank"
                  rel="noreferrer"
                  variant="default"
                  radius="md"
                  leftSection={<Navigation size={14} />}
                >
                  Maps ↗
                </Button>
              </Group>
            </Stack>
          )}
        </Modal>

        {/* Transit SOS Modal */}
        <Modal
          opened={showSosModal}
          onClose={() => {
            haptics.light();
            setShowSosModal(false);
          }}
          title={
            <Group gap="xs">
              <AlertTriangle size={18} color="#f59e0b" />
              <Text size="sm" fw={700} c="yellow.6">
                Stockholm Transit & Student Rules
              </Text>
            </Group>
          }
        >
          <Stack gap="md">
            <Alert 
              variant="light" 
              color="yellow" 
              title="Avoid the 1,850 SEK Transit Fine:" 
              icon={<AlertTriangle size={16} />}
              radius="md"
            >
              <Text size="xs" lh="md">
                SL public transit student fares strictly require an active Swedish Mecenat student card with the SL logo. Non-Swedish/French student cards do <em>not</em> qualify.
              </Text>
              <Text size="xs" fw={700} mt={6} ff="monospace">
                → Tap your French contactless card directly for standard 43 SEK fare (valid 75 min).
              </Text>
            </Alert>

            <div>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={rem(1)}>
                🎓 Where Your French MBA ID DOES Work
              </Text>
              <Text size="xs" mt={4}>
                • <strong>Fotografiska:</strong> 135 SEK (vs 195 standard)<br />
                • <strong>Moderna Museet:</strong> 140 SEK (vs 170 standard)<br />
                • <strong>Vasa Museum:</strong> No student discount for adults
              </Text>
            </div>

            <div>
              <Text size="xs" fw={700} c="dimmed" tt="uppercase" lts={rem(1)}>
                ✈️ Airport Transit (Arlanda)
              </Text>
              <Text size="xs" mt={4}>
                Flygbussarna coach: 99 SEK youth fare (if ≤25) vs 129 SEK regular. Arlanda Express is 160 SEK youth (≤25).
              </Text>
            </div>

            <Button 
              fullWidth 
              color="gray" 
              variant="light" 
              radius="md" 
              onClick={() => {
                haptics.light();
                setShowSosModal(false);
              }}
            >
              Got It
            </Button>
          </Stack>
        </Modal>

        {/* 1. WELCOME ONBOARDING MODAL */}
        <Modal
          opened={showOnboarding}
          onClose={() => completeOnboarding(false)}
          centered
          size="md"
          radius="xl"
          withCloseButton={false}
          padding="lg"
        >
          <Stack gap="md">
            <Group justify="space-between" align="center">
              <Badge variant="light" color={accentColor} size="sm">
                Step {onboardingStep + 1} of 3
              </Badge>
              <Button 
                variant="subtle" 
                color="gray" 
                size="xs" 
                onClick={() => completeOnboarding(false)}
              >
                Skip Tour
              </Button>
            </Group>

            <Progress value={((onboardingStep + 1) / 3) * 100} color={accentColor} size="xs" radius="xl" />

            {onboardingStep === 0 && (
              <Stack gap="sm" py="xs">
                <ThemeIcon size={48} radius="xl" color={accentColor} variant="light">
                  <Compass size={24} />
                </ThemeIcon>
                <Title order={3} fw={700}>
                  Welcome to Stockholm!
                </Title>
                <Text size="sm" c="dimmed" lh="md">
                  Tailored for an MBA student visiting from France. This app helps you build an island-by-island day plan with zero tourist traps.
                </Text>
                <Paper withBorder p="sm" radius="md">
                  <Text size="xs" fw={600}>
                    💡 How it works:
                  </Text>
                  <Text size="xs" c="dimmed" mt={2}>
                    Browse curated places, filter by your current vibe, and tap <strong>'+'</strong> to queue them into your day.
                  </Text>
                </Paper>
              </Stack>
            )}

            {onboardingStep === 1 && (
              <Stack gap="sm" py="xs">
                <ThemeIcon size={48} radius="xl" color="blue" variant="light">
                  <CloudRain size={24} />
                </ThemeIcon>
                <Title order={3} fw={700}>
                  Nordic Weather Pivot
                </Title>
                <Text size="sm" c="dimmed" lh="md">
                  Stockholm skies change fast. Toggle <strong>Rain Mode</strong> anytime in the top bar to instantly swap outdoor cliff walks for covered design museums and food halls.
                </Text>
                <Alert variant="light" color="blue" title="🌧️ Rain Guarantee:" radius="md">
                  ArkDes, covered saluhalls, and the underground bedrock metro art caves keep you warm and dry.
                </Alert>
              </Stack>
            )}

            {onboardingStep === 2 && (
              <Stack gap="sm" py="xs">
                <ThemeIcon size={48} radius="xl" color="yellow" variant="light">
                  <AlertTriangle size={24} />
                </ThemeIcon>
                <Title order={3} fw={700}>
                  Transit & Student Rules
                </Title>
                <Text size="sm" c="dimmed" lh="md">
                  Stockholm is 100% cashless. Tap your contactless card or phone at metro turnstiles for 43 SEK.
                </Text>
                <Alert variant="light" color="yellow" title="⚠️ Don't buy SL student tickets:" radius="md">
                  They require a Swedish Mecenat card. Foreign student IDs risk an <strong>1,850 SEK fine</strong>. Use standard 43 SEK taps!
                </Alert>
              </Stack>
            )}

            <Group justify="space-between" mt="sm">
              {onboardingStep > 0 ? (
                <Button 
                  variant="default" 
                  size="xs" 
                  onClick={() => {
                    haptics.light();
                    setOnboardingStep((s) => s - 1);
                  }}
                >
                  Back
                </Button>
              ) : <Box />}

              {onboardingStep < 2 ? (
                <Button 
                  color={accentColor} 
                  size="xs" 
                  rightSection={<ArrowRight size={14} />}
                  onClick={() => {
                    haptics.light();
                    setOnboardingStep((s) => s + 1);
                  }}
                >
                  Next
                </Button>
              ) : (
                <Button 
                  color={accentColor} 
                  size="xs" 
                  onClick={() => completeOnboarding(true)}
                >
                  Start Interactive Tour
                </Button>
              )}
            </Group>
          </Stack>
        </Modal>

        {/* 2. INTERACTIVE COACH MARKS BANNER */}
        {showCoachMark && (
          <Affix position={{ top: 124, left: 16, right: 16 }} zIndex={200}>
            <Container size="xs" px={0}>
              <motion.div
                initial={{ opacity: 0, y: -15, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -15, scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 450, damping: 25 }}
              >
                <Paper 
                  withBorder 
                  shadow="xl" 
                  radius="lg" 
                  p="sm" 
                  style={{
                    backdropFilter: 'blur(16px)',
                    borderColor: 'var(--mantine-primary-color-filled)'
                  }}
                >
                  <Group justify="space-between" align="flex-start" wrap="nowrap">
                    <Group gap="xs" align="flex-start" wrap="nowrap">
                      <ThemeIcon size={26} radius="xl" color={accentColor} variant="filled">
                        <Sparkles size={14} />
                      </ThemeIcon>
                      <div>
                        <Text size="xs" fw={700}>
                          {coachStep === 0 && 'Tip 1: Queue Your Spots'}
                          {coachStep === 1 && 'Tip 2: Rain & Freeze Pivot'}
                          {coachStep === 2 && 'Tip 3: Student Transit Rules'}
                          {coachStep === 3 && 'Tip 4: Island Route Tray'}
                        </Text>
                        <Text size="xs" c="dimmed" mt={2}>
                          {coachStep === 0 && "Tap '+' on any card to add it to your day queue. Tap 'Tips & Transit' for insider details."}
                          {coachStep === 1 && "Notice this switch in the header? Toggle it when it rains or sleets to swap outdoor walks."}
                          {coachStep === 2 && "Tap the SOS icon anytime to verify museum student discounts and transit rules."}
                          {coachStep === 3 && "The bottom tray groups your day by island so you never backtrack across bridges. Tap it to expand!"}
                        </Text>
                      </div>
                    </Group>

                    <Group gap={6} wrap="nowrap">
                      <Button 
                        size="compact-xs" 
                        color={accentColor} 
                        radius="md"
                        onClick={nextCoachStep}
                      >
                        {coachStep === 3 ? 'Done' : 'Next'}
                      </Button>
                      <ActionIcon 
                        size="sm" 
                        variant="subtle" 
                        color="gray" 
                        onClick={() => {
                          haptics.light();
                          setShowCoachMark(false);
                        }}
                        title="Dismiss tips"
                      >
                        <Trash2 size={13} />
                      </ActionIcon>
                    </Group>
                  </Group>
                </Paper>
              </motion.div>
            </Container>
          </Affix>
        )}
      </AppShell>
    </MantineProvider>
  );
}
