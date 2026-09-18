import { getStage } from "../narrative/narrativeConfig";
import { SupplyNode, type SupplyRole } from "./SupplyNode";
import { FragmentedConnection } from "./FragmentedConnection";
import { useIsMobile } from "../hooks/useIsMobile";

interface NodeConfig {
  role: SupplyRole;
  position: [number, number, number];
  bobOffset: number;
}

// A compact diagonal cluster glimpsed off to the side of the road as the
// truck passes — these four are cut off from EACH OTHER (fragmented
// connections below), not from the truck's own continuous route.
const NODES: NodeConfig[] = [
  { role: "manufacturer", position: [-1.2, 0.8, 1.0], bobOffset: 0 },
  { role: "distributor", position: [0.2, -0.5, 0.3], bobOffset: 1.4 },
  { role: "retailer", position: [1.3, 0.6, -0.5], bobOffset: 2.6 },
  { role: "consumer", position: [2.4, -0.3, -1.3], bobOffset: 4.1 },
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
