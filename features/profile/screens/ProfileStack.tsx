// import { createStackNavigator } from '@react-navigation/stack';
// import { ProfileStats } from '@/features/profile/sections/ProfileStats';
// import { ReportedUsersScreen } from '@/features/profile/screens/ReportedUsersScreen';
// import { ReportDetailScreen } from '@/features/profile/screens/ReportDetailScreen'; // Nếu có

// const Stack = createStackNavigator();

// export default function ProfileStack() {
//   return (
//     <Stack.Navigator>
//       {/* Các màn hình khác */}
//       <Stack.Screen
//         name="ProfileStats"
//         component={ProfileStats}
//         options={{ title: 'Thống kê cá nhân' }}
//       />
//       <Stack.Screen
//         name="ReportedUsers"
//         component={ReportedUsersScreen}
//         options={{ title: 'Người bị báo cáo' }}
//       />
//       <Stack.Screen
//         name="ReportDetail"
//         component={ReportDetailScreen}
//         options={{ title: 'Chi tiết báo cáo' }}
//       />
//     </Stack.Navigator>
//   );
// }