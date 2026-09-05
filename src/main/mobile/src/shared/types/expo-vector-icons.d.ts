declare module "@expo/vector-icons" {
  import { Component } from "react";
  import { TextProps } from "react-native";

  interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }

  export class Feather extends Component<IconProps> {}
  export class MaterialCommunityIcons extends Component<IconProps> {}
  export class MaterialIcons extends Component<IconProps> {}
  export class FontAwesome extends Component<IconProps> {}
  export class Ionicons extends Component<IconProps> {}
  export class AntDesign extends Component<IconProps> {}
  export class Entypo extends Component<IconProps> {}
  export class SimpleLineIcons extends Component<IconProps> {}
  export class Octicons extends Component<IconProps> {}
  export class Foundation extends Component<IconProps> {}
  export class EvilIcons extends Component<IconProps> {}
}

declare module "@expo/vector-icons/Feather" {
  import { Component } from "react";
  import { TextProps } from "react-native";
  interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }
  export default class Feather extends Component<IconProps> {}
}

declare module "@expo/vector-icons/MaterialCommunityIcons" {
  import { Component } from "react";
  import { TextProps } from "react-native";
  interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }
  export default class MaterialCommunityIcons extends Component<IconProps> {}
}

declare module "@expo/vector-icons/MaterialIcons" {
  import { Component } from "react";
  import { TextProps } from "react-native";
  interface IconProps extends TextProps {
    name: string;
    size?: number;
    color?: string;
  }
  export default class MaterialIcons extends Component<IconProps> {}
}
