import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Drawer } from "expo-router/drawer";
import { StyleSheet } from "react-native";

export default function Layout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <Drawer>
        <Drawer.Screen
          name="(tabs)"
          options={{ drawerLabel: "Home", headerShown: false }}
        />

        <Drawer.Screen
          name="accounts"
          options={{
            drawerLabel: "Accounts",
            title: "Accounts",
            headerShown: false,
          }}
        />
        <Drawer.Screen
          name="transactions"
          options={{
            drawerLabel: "Transactions",
            title: "Transactions",
          }}
        />
        <Drawer.Screen
          name="currencies"
          options={{
            drawerLabel: "Currencies",
            title: "Currencies",
            headerShown: false,
          }}
        />
        <Drawer.Screen
          name="expcategories"
          options={{
            drawerLabel: "Expense Categories",
            title: "Expense Categories",
            headerShown: false,
          }}
        />

        <Drawer.Screen
          name="exportimport"
          options={{
            drawerLabel: "Export/Import data",
            title: "Export/Import data",
            headerShown: true,
          }}
        /> 
        <Drawer.Screen
          name="settings"
          options={{
            drawerLabel: "Settings",
            title: "Settings",
            headerShown: true,
          }}
        />
      </Drawer>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
