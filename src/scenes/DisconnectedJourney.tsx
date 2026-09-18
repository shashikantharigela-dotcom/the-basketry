import { getStage } from "../narrative/narrativeConfig";
import { SupplyNode, type SupplyRole } from "./SupplyNode";
import { FragmentedConnection } from "./FragmentedConnection";
import { useIsMobile } from "../hooks/useIsMobile";

interface NodeConfig {
  role: SupplyRole;
  position: [number, number, number];
  bobOffset: number;
}

// A clear left-to-right journey with a mild diagonal (slight depth and
// height variation), rather than heavy depth staggering — a wide spread
// in z compresses unevenly in perspective and bunches the nodes back
// together on screen. Every node's x sits to the right of the camera's
// look-at target (see narrativeConfig), so even the "leftmost" node in
// the journey stays clear of the DOM text column.
const NODES: NodeConfig[] = [
  { role: "manufacturer", position: [0.6, 1.0, 1.5], bobOffset: 0 },
  { role: "distributor", position: [2.4, -0.6, 0.5], bobOffset: 1.4 },
  { role: "retailer", position: [4.2, 0.8, -0.5], bobOffset: 2.6 },
  { role: "consumer", position: [6.0, -0.5, -1.5], bobOffset: 4.1 },
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
