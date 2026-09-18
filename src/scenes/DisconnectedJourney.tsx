import { getStage } from "../narrative/narrativeConfig";
import { SupplyNode, type SupplyRole } from "./SupplyNode";
import { FragmentedConnection } from "./FragmentedConnection";
import { useIsMobile } from "../hooks/useIsMobile";

interface NodeConfig {
  role: SupplyRole;
  position: [number, number, number];
  bobOffset: number;
}

// A zig-zagging, staggered-depth arrangement rather than a straight
// flowchart row — the spatial "friction" is part of the story.
const NODES: NodeConfig[] = [
  { role: "manufacturer", position: [-3.4, 0.7, 1.6], bobOffset: 0 },
  { role: "distributor", position: [-1.1, -0.5, -0.8], bobOffset: 1.4 },
  { role: "retailer", position: [1.4, 0.6, -2.6], bobOffset: 2.6 },
  { role: "consumer", position: [3.6, -0.3, -4.6], bobOffset: 4.1 },
];

export function DisconnectedJourney() {
  const stage = getStage("disconnected");
  const isMobile = useIsMobile();
  const fragmentCount = isMobile ? 3 : 4;

  return (
    <group position={stage.anchor}>
      {NODES.map((node) => (
        <SupplyNode key={node.role} position={node.position} role={node.role} bobOffset={node.bobOffset} />
      ))}

      <FragmentedConnection
        start={NODES[0].position}
        end={NODES[1].position}
        fragmentCount={fragmentCount}
        revealOffset={0}
      />
      <FragmentedConnection
        start={NODES[1].position}
        end={NODES[2].position}
        fragmentCount={fragmentCount}
        revealOffset={0.06}
      />
      <FragmentedConnection
        start={NODES[2].position}
        end={NODES[3].position}
        fragmentCount={fragmentCount}
        revealOffset={0.12}
      />
    </group>
  );
}
