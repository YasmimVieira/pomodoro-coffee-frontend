#!/bin/bash
# Remove aps-environment para buildar com Apple ID gratuito
ENTITLEMENTS="ios/PomodoroCoffee/PomodoroCoffee.entitlements"
if [ -f "$ENTITLEMENTS" ]; then
  cat > "$ENTITLEMENTS" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
  <dict>
  </dict>
</plist>
EOF
  echo "✓ Entitlements limpo"
fi
