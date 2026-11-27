import { leafColour } from '../data/leafColours';

export function MemberLeaf({ name, color, angle = 0, showInitial = true, className = '' }) {
  const tone = leafColour(color);
  const [initial = ''] = Array.from(name?.trim() || '');

  return (
    <span className={`member-leaf ${className}`} aria-hidden="true" style={{
      '--member-tone': tone.value,
      '--leaf-angle': `${angle}deg`,
    }}>
      <span className="leaf-silhouette" />
      {showInitial && <span className="leaf-initial">{initial.toUpperCase()}</span>}
    </span>
  );
}

const leafAngles = [-24, 21, -13, 33];

export default function LeafGroup({ members = [], interactive = false }) {
  return (
    <ul className="leaf-group" aria-label="Clover members">
      {members.map((member, index) => {
        const leaf = <MemberLeaf name={member.name} color={member.color} angle={leafAngles[index % leafAngles.length]} />;
        return (
          <li className="leaf-member" key={`${member.name}-${index}`}>
            {interactive ? (
              <button className="leaf" type="button" aria-label={member.name} title={member.name}
                onClick={() => alert(`${member.name}'s shared diary is a prototype view.`)}>
                {leaf}
              </button>
            ) : <>{leaf}<span className="visually-hidden">{member.name}</span></>}
          </li>
        );
      })}
    </ul>
  );
}
