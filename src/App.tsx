import { useState, useMemo, useEffect } from 'react';
import { 
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
  rem
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { 
  CloudRain, 
  Sun, 
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
  Beer
} from 'lucide-react';
import { STOCKHOLM_PLACES } from './data/places';
import { Place } from './types';

export default function App() {
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

  // Sync to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('sthlm_day_queue', JSON.stringify(dayQueue));
    } catch (e) {
      console.warn('Could not save to localStorage', e);
    }
  }, [dayQueue]);

  const toggleQueue = (id: string) => {
    if (navigator.vibrate) navigator.vibrate(10);
    const place = places.find(p => p.id === id);
    const isAdding = !dayQueue.includes(id);

    setDayQueue((prev) => 
      isAdding ? [...prev, id] : prev.filter((item) => item !== id)
    );

    if (place) {
      notifications.show({
        title: isAdding ? 'Added to Day Plan' : 'Removed from Day Plan',
        message: `${place.title} (${place.neighborhood})`,
        color: isAdding ? 'emerald' : 'gray',
        autoClose: 2000,
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
    <AppShell
      header={{ height: 110 }}
      padding="0"
      className="bg-[#090a0f] text-neutral-100 min-h-screen"
    >
      {/* Mantine AppShell Header */}
      <AppShell.Header 
        className="bg-[#090a0f]/90 backdrop-blur-md border-b border-neutral-800/80 px-4 py-2.5"
      >
        <Container size="xs" px={0}>
          <Group justify="space-between" align="center">
            <div>
              <Text 
                size="xs" 
                fw={700} 
                c="emerald.5" 
                className="font-mono tracking-widest uppercase"
              >
                Stockholm · MBA Guide
              </Text>
              <Title order={3} fw={700} c="white" className="tracking-tight">
                Pick Your Day
              </Title>
            </div>

            <Group gap="xs">
              {/* Rain Mode Switch */}
              <Switch
                size="md"
                color="sky"
                checked={rainMode}
                onChange={(event) => setRainMode(event.currentTarget.checked)}
                onLabel={<CloudRain size={13} color="white" />}
                offLabel={<Sun size={13} color="#f59e0b" />}
                aria-label="Toggle Rain Mode"
              />

              {/* Student Transit SOS Button */}
              <ActionIcon
                variant="light"
                color="yellow"
                radius="xl"
                size="lg"
                onClick={() => setShowSosModal(true)}
                title="Transit warnings & student ID rules"
              >
                <AlertTriangle size={18} />
              </ActionIcon>
            </Group>
          </Group>

          {/* Mantine Segmented Control for Vibe Filters */}
          <Box mt="xs" className="overflow-x-auto no-scrollbar">
            <SegmentedControl
              size="xs"
              radius="xl"
              value={activeCategory}
              onChange={setActiveCategory}
              color="emerald"
              data={[
                { label: 'All', value: 'all' },
                { label: 'Free Only', value: 'free' },
                { label: 'Culture', value: 'museum' },
                { label: 'Tech & MBA', value: 'tech-mba' },
                { label: 'Fika & Food', value: 'eats-fika' },
                { label: 'Nightlife', value: 'nightlife' },
              ]}
              styles={{
                root: { backgroundColor: '#14151f', border: '1px solid rgba(255,255,255,0.06)' },
                label: { padding: '4px 10px', fontSize: '11px', fontWeight: 600 },
              }}
            />
          </Box>
        </Container>
      </AppShell.Header>

      {/* Main Content Area */}
      <AppShell.Main className="pb-36 pt-3">
        <Container size="xs" px="md">
          {rainMode && (
            <Paper 
              withBorder 
              radius="lg" 
              p="sm" 
              mb="md" 
              className="bg-sky-950/40 border-sky-800/40"
            >
              <Group gap="xs" align="flex-start" wrap="nowrap">
                <CloudRain size={18} className="text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <Text size="xs" fw={700} c="sky.1">
                    Rain & Cold Weather Mode Active
                  </Text>
                  <Text size="xs" c="sky.2" mt={2}>
                    Outdoor walks swapped with indoor architecture gems (ArkDes) and covered food halls.
                  </Text>
                </div>
              </Group>
            </Paper>
          )}

          <Group justify="space-between" mb="xs" px={rem(2)}>
            <Text size="xs" c="dimmed" fw={500}>
              {filteredPlaces.length} curated places
            </Text>
            <Text size="xs" c="dimmed">
              Tap '+' to queue into your day
            </Text>
          </Group>

          {/* Place Cards Stack */}
          <Stack gap="sm">
            {filteredPlaces.map((place) => {
              const isQueued = dayQueue.includes(place.id);
              return (
                <Card 
                  key={place.id}
                  withBorder
                  radius="lg"
                  p="md"
                  className={`transition-all duration-200 ${
                    isQueued 
                      ? 'bg-[#12141f] border-emerald-500/50 shadow-lg shadow-emerald-500/5' 
                      : 'bg-[#0f1118]/80 border-neutral-800/80 hover:border-neutral-700'
                  }`}
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
                          color={place.costSek === 0 ? 'emerald' : 'gray'} 
                          size="xs"
                        >
                          {place.costLabel}
                        </Badge>
                        <Group gap={3} c="dimmed">
                          <Clock size={12} />
                          <Text size="xs" span className="font-mono">{place.durationMin}m</Text>
                        </Group>
                      </Group>

                      <Title order={5} fw={600} c="white" className="leading-snug">
                        {place.title}
                      </Title>

                      <Text size="xs" c="dimmed" lineClamp={2} mt={4} className="leading-relaxed">
                        {place.mbaNote}
                      </Text>

                      <Group gap="xs" mt="xs">
                        <Button
                          variant="subtle"
                          color="gray"
                          size="compact-xs"
                          leftSection={<Info size={12} />}
                          onClick={() => setActiveDetailId(place.id)}
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

                    {/* Action Add/Remove Button */}
                    <ActionIcon
                      variant={isQueued ? 'filled' : 'light'}
                      color={isQueued ? 'emerald' : 'dark'}
                      size="lg"
                      radius="md"
                      onClick={() => toggleQueue(place.id)}
                      aria-label={isQueued ? 'Remove from day' : 'Add to day'}
                    >
                      {isQueued ? <Check size={16} strokeWidth={2.5} /> : <Plus size={16} />}
                    </ActionIcon>
                  </Group>
                </Card>
              );
            })}
          </Stack>
        </Container>
      </AppShell.Main>

      {/* Mantine Affix: Floating Sticky Day Tray Pill */}
      <Affix position={{ bottom: 16, right: 16, left: 16 }}>
        <Container size="xs" px={0}>
          <Paper
            withBorder
            shadow="xl"
            radius="xl"
            p="xs"
            className="bg-[#12141f]/95 backdrop-blur-xl border-neutral-700/80 cursor-pointer transition-transform active:scale-[0.99]"
            onClick={() => setIsTrayOpen(true)}
          >
            <Group justify="space-between" align="center" px="xs">
              <Group gap="sm">
                <Badge 
                  size="xl" 
                  circle 
                  color="emerald" 
                  variant="light"
                  className="font-bold font-mono"
                >
                  {dayQueue.length}
                </Badge>
                <div>
                  <Group gap={6} align="center">
                    <Text size="xs" fw={700} c="white">
                      My Stockholm Day
                    </Text>
                    <Badge size="xs" variant="outline" color="gray">
                      {Math.round(totalDurationMin / 60 * 10) / 10} hrs
                    </Badge>
                  </Group>
                  <Text size="xs" c="dimmed" className="font-mono">
                    Spend: {totalCostSek} SEK (~€{Math.round(totalCostSek / 11.2)})
                  </Text>
                </div>
              </Group>

              <Button
                variant="light"
                color="emerald"
                size="xs"
                radius="xl"
                rightSection={<ChevronUp size={14} />}
              >
                View Route
              </Button>
            </Group>
          </Paper>
        </Container>
      </Affix>

      {/* Mantine Drawer: Native Mobile Bottom Sheet Day Tray */}
      <Drawer
        opened={isTrayOpen}
        onClose={() => setIsTrayOpen(false)}
        position="bottom"
        size="85%"
        radius="xl"
        title={
          <div>
            <Title order={4} fw={700} c="white">
              Your Curated Day Route
            </Title>
            <Text size="xs" c="dimmed">
              Auto-clustered by island to stop transit backtracking
            </Text>
          </div>
        }
        styles={{
          content: { backgroundColor: '#10121a', color: '#f3f4f6' },
          header: { backgroundColor: '#10121a', borderBottom: '1px solid rgba(255,255,255,0.06)' },
        }}
      >
        <Stack gap="lg" mt="sm">
          {Object.keys(groupedByIsland).length === 0 ? (
            <Text size="sm" c="dimmed" ta="center" py="xl">
              Your day tray is empty. Tap '+' on cards to start planning!
            </Text>
          ) : (
            <Timeline active={Object.keys(groupedByIsland).length} bulletSize={28} lineWidth={2} color="emerald">
              {Object.entries(groupedByIsland).map(([island, items]) => (
                <Timeline.Item 
                  key={island} 
                  bullet={<MapPin size={14} />}
                  title={
                    <Group gap="xs">
                      <Text size="xs" fw={700} className="font-mono tracking-wider uppercase" c="emerald.4">
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
                        className="bg-[#090a0f]/80 border-neutral-800"
                      >
                        <Group justify="space-between" align="flex-start" wrap="nowrap">
                          <div>
                            <Text size="xs" fw={600} c="white">{place.title}</Text>
                            <Text size="xs" c="dimmed" mt={2}>{place.transitTip}</Text>
                            <Text size="xs" c="emerald.4" mt={4} className="font-mono">
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
            <Paper withBorder radius="lg" p="md" className="bg-[#090a0f] border-neutral-800">
              <Text size="xs" fw={700} c="white" mb="xs">
                Budget & Transit Summary
              </Text>
              <SimpleGrid cols={2} spacing="xs">
                <div>
                  <Text size="xs" c="dimmed">Activities:</Text>
                  <Text size="xs" fw={600} className="font-mono">{totalCostSek} SEK</Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">Est. Duration:</Text>
                  <Text size="xs" fw={600} className="font-mono">{Math.round(totalDurationMin / 60 * 10) / 10}h</Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">SL Transit:</Text>
                  <Text size="xs" fw={600} className="font-mono">
                    {Object.keys(groupedByIsland).length} taps (~{Object.keys(groupedByIsland).length * 43} SEK)
                  </Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">Euro Equiv:</Text>
                  <Text size="xs" fw={700} c="emerald.4" className="font-mono">
                    ~€{Math.round((totalCostSek + Object.keys(groupedByIsland).length * 43) / 11.2)}
                  </Text>
                </div>
              </SimpleGrid>
            </Paper>
          )}

          <Group grow>
            <Button
              color="emerald"
              radius="md"
              leftSection={<Share2 size={15} />}
              onClick={() => {
                navigator.clipboard?.writeText(
                  `My Stockholm Day:\n` +
                  queuedPlaces.map((p, i) => `${i + 1}. ${p.title} (${p.neighborhood})`).join('\n') +
                  `\nTotal Budget: ~${totalCostSek} SEK`
                );
                notifications.show({
                  title: 'Itinerary Copied',
                  message: 'Formatted route copied to clipboard for WhatsApp!',
                  color: 'emerald',
                });
              }}
            >
              Copy Route Plan
            </Button>
            <Button
              variant="light"
              color="gray"
              radius="md"
              onClick={() => setDayQueue([])}
            >
              Clear
            </Button>
          </Group>
        </Stack>
      </Drawer>

      {/* Mantine Modal: Place Details */}
      <Modal
        opened={Boolean(activeDetailPlace)}
        onClose={() => setActiveDetailId(null)}
        title={
          activeDetailPlace && (
            <Group gap="xs">
              <Badge variant="light" color="emerald" size="xs">
                {activeDetailPlace.neighborhood}
              </Badge>
              <Text size="sm" fw={700} c="white">
                {activeDetailPlace.title}
              </Text>
            </Group>
          )
        }
        styles={{
          content: { backgroundColor: '#10121a', color: '#f3f4f6' },
          header: { backgroundColor: '#10121a', borderBottom: '1px solid rgba(255,255,255,0.06)' },
        }}
      >
        {activeDetailPlace && (
          <Stack gap="md">
            <div>
              <Text size="xs" fw={700} c="dimmed" className="uppercase tracking-wider">
                Why It Fits An MBA Student
              </Text>
              <Text size="xs" c="gray.2" mt={3} className="leading-relaxed">
                {activeDetailPlace.mbaNote}
              </Text>
            </div>

            <div>
              <Text size="xs" fw={700} c="dimmed" className="uppercase tracking-wider">
                Transit Tip
              </Text>
              <Text size="xs" c="gray.2" mt={3}>
                {activeDetailPlace.transitTip}
              </Text>
            </div>

            <div>
              <Text size="xs" fw={700} c="dimmed" className="uppercase tracking-wider">
                Student & Pricing Policy
              </Text>
              <Text size="xs" c="gray.2" mt={3}>
                {activeDetailPlace.studentDiscountNote}
              </Text>
            </div>

            <Divider color="neutral.8" />

            <Group grow>
              <Button
                color={dayQueue.includes(activeDetailPlace.id) ? 'red' : 'emerald'}
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

      {/* Mantine Modal: Transit SOS & Student ID Rules */}
      <Modal
        opened={showSosModal}
        onClose={() => setShowSosModal(false)}
        title={
          <Group gap="xs">
            <AlertTriangle size={18} color="#f59e0b" />
            <Text size="sm" fw={700} c="yellow.4">
              Stockholm Transit & Student Rules
            </Text>
          </Group>
        }
        styles={{
          content: { backgroundColor: '#10121a', color: '#f3f4f6' },
          header: { backgroundColor: '#10121a', borderBottom: '1px solid rgba(255,255,255,0.06)' },
        }}
      >
        <Stack gap="md">
          <Paper withBorder radius="md" p="sm" className="bg-amber-950/40 border-amber-800/40">
            <Text size="xs" fw={700} c="yellow.2">
              Avoid the 1,850 SEK Transit Fine:
            </Text>
            <Text size="xs" c="amber.1" mt={4} className="leading-relaxed">
              SL public transit student fares strictly require an active Swedish Mecenat student card with the SL logo. Non-Swedish/French student cards do <em>not</em> qualify.
            </Text>
            <Text size="xs" fw={600} c="yellow.3" mt={6} className="font-mono">
              → Tap your French contactless card directly for standard 43 SEK fare (valid 75 min).
            </Text>
          </Paper>

          <div>
            <Text size="xs" fw={700} c="dimmed" className="uppercase tracking-wider">
              🎓 Where Your French MBA ID DOES Work
            </Text>
            <Text size="xs" c="gray.3" mt={4}>
              • <strong>Fotografiska:</strong> 135 SEK (vs 195 standard)<br />
              • <strong>Moderna Museet:</strong> 140 SEK (vs 170 standard)<br />
              • <strong>Vasa Museum:</strong> No student discount for adults
            </Text>
          </div>

          <div>
            <Text size="xs" fw={700} c="dimmed" className="uppercase tracking-wider">
              ✈️ Airport Transit (Arlanda)
            </Text>
            <Text size="xs" c="gray.3" mt={4}>
              Flygbussarna coach: 99 SEK youth fare (if ≤25) vs 129 SEK regular. Arlanda Express is 160 SEK youth (≤25).
            </Text>
          </div>

          <Button 
            fullWidth 
            color="gray" 
            variant="light" 
            radius="md" 
            onClick={() => setShowSosModal(false)}
          >
            Got It
          </Button>
        </Stack>
      </Modal>
    </AppShell>
  );
}
