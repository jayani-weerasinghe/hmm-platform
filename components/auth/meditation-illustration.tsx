export function MeditationIllustration({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 400 330"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* ── Large back leaves (deep blue) ── */}
      <path d="M195 245 C162 195 148 130 182 68 C172 128 175 195 195 245" fill="#2D5FA6" />
      <path d="M195 245 C168 205 152 148 184 76" stroke="#1E4F96" strokeWidth="1.5" fill="none" opacity="0.5" />
      <path d="M205 245 C238 195 252 130 218 68 C228 128 225 195 205 245" fill="#2D5FA6" />
      <path d="M205 245 C232 205 248 148 216 76" stroke="#1E4F96" strokeWidth="1.5" fill="none" opacity="0.5" />

      {/* ── Medium leaves (lighter blue) ── */}
      <path d="M188 258 C145 212 132 162 168 112 C158 158 164 212 188 258" fill="#4B7EC8" />
      <path d="M212 258 C255 212 268 162 232 112 C242 158 236 212 212 258" fill="#4B7EC8" />

      {/* ── Small accent leaves ── */}
      <path
        d="M170 168 C142 138 144 102 168 88 C160 110 162 142 170 168"
        fill="#4B7EC8"
        transform="rotate(-12 170 130)"
      />
      <path
        d="M230 158 C258 128 258 92 234 78 C242 100 240 132 230 158"
        fill="#4B7EC8"
        transform="rotate(12 230 120)"
      />

      {/* ── Yoga mat (amber) ── */}
      <ellipse cx="200" cy="300" rx="118" ry="14" fill="#F5A623" opacity="0.35" />
      <path d="M100 292 Q200 278 300 292 L296 306 Q200 294 104 306 Z" fill="#F5A623" />

      {/* ── Left pot ── */}
      <ellipse cx="126" cy="280" rx="17" ry="6" fill="#C97D0A" />
      <path d="M109 280 Q110 298 126 300 Q142 298 143 280 Z" fill="#F5A623" />
      <rect x="116" y="266" width="20" height="15" rx="3" fill="#F5A623" />
      <ellipse cx="126" cy="266" rx="10" ry="4" fill="#C97D0A" />
      <ellipse cx="126" cy="266" rx="5" ry="2" fill="#F5A623" opacity="0.55" />

      {/* ── Right pot ── */}
      <ellipse cx="274" cy="280" rx="17" ry="6" fill="#C97D0A" />
      <path d="M257 280 Q258 298 274 300 Q290 298 291 280 Z" fill="#F5A623" />
      <rect x="264" y="266" width="20" height="15" rx="3" fill="#F5A623" />
      <ellipse cx="274" cy="266" rx="10" ry="4" fill="#C97D0A" />
      <ellipse cx="274" cy="266" rx="5" ry="2" fill="#F5A623" opacity="0.55" />

      {/* ── Legs in lotus ── */}
      <path d="M152 268 Q165 282 200 275 Q200 268 188 264 Q172 260 152 268" fill="#F5A623" />
      <path d="M248 268 Q235 282 200 275 Q200 268 212 264 Q228 260 248 268" fill="#F5A623" />
      <path d="M154 271 Q148 276 145 280" stroke="#C97D0A" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M246 271 Q252 276 255 280" stroke="#C97D0A" strokeWidth="1.5" strokeLinecap="round" />

      {/* ── Torso ── */}
      <path
        d="M183 208 Q182 268 200 271 Q218 268 217 208 Q210 197 200 195 Q190 197 183 208"
        fill="#F5A623"
      />
      {/* shirt line */}
      <path d="M186 220 Q200 226 214 220" stroke="#C97D0A" strokeWidth="1.5" fill="none" />

      {/* ── Left arm ── */}
      <path d="M183 214 Q170 224 173 242 Q181 237 187 225 Z" fill="#F5A623" />
      {/* ── Right arm ── */}
      <path d="M217 214 Q230 224 227 242 Q219 237 213 225 Z" fill="#F5A623" />
      {/* ── Hands in prayer ── */}
      <path
        d="M187 222 Q200 215 213 222 Q211 242 200 246 Q189 242 187 222"
        fill="#FDE8C0"
      />

      {/* ── Necklace ── */}
      <circle cx="200" cy="204" r="4.5" fill="#3461A8" />
      <path d="M187 202 Q193 207 200 204 Q207 207 213 202" stroke="#3461A8" strokeWidth="1.5" fill="none" />

      {/* ── Head ── */}
      <circle cx="200" cy="174" r="27" fill="#F5A623" />

      {/* ── Closed eyes (peaceful arcs) ── */}
      <path d="M192 171 Q194.5 175 197 171" stroke="#C97D0A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      <path d="M203 171 Q205.5 175 208 171" stroke="#C97D0A" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* ── Subtle smile ── */}
      <path d="M195 181 Q200 185.5 205 181" stroke="#C97D0A" strokeWidth="1.5" fill="none" strokeLinecap="round" />

      {/* ── Hair (blue) ── */}
      <path
        d="M176 170 Q175 150 200 147 Q225 150 224 170 Q215 160 200 158 Q185 160 176 170"
        fill="#3461A8"
      />
      {/* bun / top of hair */}
      <path
        d="M200 147 Q209 133 205 118 Q200 129 195 118 Q191 133 200 147"
        fill="#3461A8"
      />
      {/* side lock */}
      <path d="M178 168 Q172 179 174 192 Q178 182 182 170" fill="#3461A8" />

      {/* ── Sparkles ── */}
      {/* top-left sparkle */}
      <path
        d="M150 138 L152 130 L154 138 L162 140 L154 142 L152 150 L150 142 L142 140 Z"
        fill="white"
      />
      {/* top-right sparkle */}
      <path
        d="M248 123 L250 116 L252 123 L259 125 L252 127 L250 134 L248 127 L241 125 Z"
        fill="white"
      />
      {/* left small sparkle */}
      <path
        d="M135 212 L136.5 207 L138 212 L143 213.5 L138 215 L136.5 220 L135 215 L130 213.5 Z"
        fill="white"
        opacity="0.8"
      />
      {/* right small sparkle */}
      <path
        d="M262 198 L263.5 193 L265 198 L270 199.5 L265 201 L263.5 206 L262 201 L257 199.5 Z"
        fill="white"
        opacity="0.8"
      />
      {/* tiny above-head sparkle */}
      <path
        d="M218 110 L219 106.5 L220 110 L223.5 111 L220 112 L219 115.5 L218 112 L214.5 111 Z"
        fill="white"
        opacity="0.7"
      />
    </svg>
  )
}
